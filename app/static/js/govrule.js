// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function GovRule(d, cb) {
	this.div = (d.div===undefined) ? UI.getMainDiv() : d.div;
	this.mode = d.mode; 
	this.parts = d.parts; // if true, show supplied value and not access to db
	this.key = d.key;
	this.cipher = d.cipher;
	this.data = d.data;
	this.cb = cb;
}

GovRule.prototype = {
	draw : function() {
		var self = this;
		return self.layout().then(function() {
			return self.load().then(function() {
				return Util.promise(function(resolve) {
					resolve();
				});
			});
		});
	},

	layout : function() {
		var self = this;
		return Util.load(self.div, 'parts/govrule.html', function(resolve) {
			Util.initDiv(self.div, self.mode, {
			});
			if (self.parts) {
				self.div.find('[field]').attr('field', '');
			}
			if (self.mode!==MODE.REF) {
				self.div.find('[class^=rdata]').addClass('redit');
			}
			resolve();
		});
	},

	load : function() {
		var self = this;
		if (self.parts) {
			return Util.promise(function(resolve, reject) {
				self.div.find('div[name="title"]').css('display', 'none');
				self.div.find('div[name="bottom"]').css('display', 'none');
				self.set(self.data);
				resolve();
			});
		}
		return (function() {
			return Util.promise(function(resolve, reject) {
				if (self.cipher) {
					resolve();
					return;
				}
				Rpc.call('cipher.load', [{
					id : self.key.groupid,
					ver : self.key.ver,
					draftno : self.key.draftno
				}], function(res) {
					if (res.result.code) {
						reject(res.result.code);
						return;
					}
					self.cipher = res.result;
					resolve();
				});
			});
		})().then(function() {
			return Util.promise(function(resolve, reject) {
				if (self.mode===MODE.NEW) {
					self.set({})
					resolve();
					return;
				}
				Rpc.call('rule.get', [{
						groupid : self.key.groupid, 
						ver : self.key.ver, 
						draftno : self.key.draftno,
						id : self.key.id
				}], function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						reject();
						return;
					}
					self.set(res.result);
					resolve();
				});
			});
		});
	},

	set : function(data) {
		var self = this;
		if (data.req===undefined) data.req = 0;
		if (data.auth===undefined) data.auth = '';
		self.data = data;
		Util.setData(self.div, data);

		// show data
		var td = self.div.find('[class^=rdata]');
		td.eq(0).empty().attr('val', self.data.req).click(function() {
			if (self.mode===MODE.REF) return;
			var elm = td.eq(0);
			var txt = $('<input>', { type:'text', value:elm.attr('val') });
			txt.css({
				width:elm.width(),
				height:elm.height(),
			});
			elm.empty().append(txt);
			txt.on('blur', function(){
				$(this).remove();
				var v = 0;
				try {
					v = parseInt($(this).val());
					v = isNaN(v) ? 0 : v;
				} catch (e) {
				}
				elm.attr('val', v);
				self.drawNumerator();
			}).focus().select();
		});
		self.drawNumerator();
		td.eq(1).attr('val', self.data.auth).click(function() {
			if (self.mode===MODE.REF) return;
			var selected = [];
			var elm = td.eq(1);
			var v = elm.attr('val');
			v = (v!=='') ? v.split(',') : [];
			var auth = UI.popup(400,430);
			for ( var i in v ) {
				selected.push(v[i]);
			}
			var sel = new SelPerson(auth, function(ok, sp) {
				if (ok===true) {
					td.eq(1).attr('val', sp.join(','));
					self.drawDenominator();
				}
				UI.closePopup();
			}, selected);
		});
		self.drawDenominator();
		if (self.parts) return;

		// initialize button
		var user = UserManager.isLogin() ? UserManager.user().id : '';
		var vcipher = Validator.cipher;
		var btns = [];
		// BUTTON
		switch (self.mode) {
		case MODE.NEW:
			if (_C(vcipher.isEditable(self.cipher, user))) {
				btns.push({
					text : 'CREATE',
					click : function() {
						self.create();
					}
				});
			}
			btns.push({
				text : 'BACK',
				click : function() {
					History.back();
				}
			});
			break;
		case MODE.EDIT:
			if (_C(vcipher.isEditable(self.cipher, user))) {
				btns.push({
					text : 'COMMIT',
					click : function() {
						self.commit();
					}
				});
			}
			btns.push({
				text : 'CANCEL',
				click : function() {
					self.cancel();
				}
			});
			break;
		case MODE.REF:
			if (_C(vcipher.isEditable(self.cipher, user))) {
				btns.push({
					text : 'EDIT',
					click : function() {
						self.mode = MODE.EDIT;
						self.draw();
					}
				});
			}
			btns.push({
				text : 'BACK',
				click : function() {
					History.back();
				}
			});
			break;
		}
		Util.initButton(self.div.find('div[name="bottom"] button'), btns);
	},

	get : function() {
		var d = this.div.find('[class^=rdata]');
		var cur = Util.getData(this.div, {
			groupid : this.key ? this.key.groupid : '',
			ver : this.key ? Util.toInt(this.key.ver) : 0,
			id : this.key ? this.key.id : '',
			draftno : this.key ? Util.toInt(this.key.draftno) : 0,
			req : Util.toInt(d.eq(0).attr('val')),
			auth : d.eq(1).attr('val')
		});
		return {ini:this.data, cur:cur};
	},

	cancel : function() {
		this.mode = MODE.REF;
		this.draw();
	},

	create : function() {
		var self = this;
		var v = self.get();
		return Util.promise(function(resolve, reject) {
			Rpc.call('rule._add', [v.cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					return;
				}
				self.key.id = res.result;
				self.mode = MODE.REF;
				self.draw();
				resolve();
			});
		});
	},

	commit : function() {
		var self = this;
		var v = self.get();
		return Util.promise(function(resolve, reject) {
			Rpc.call('rule._commit', [v.ini, v.cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					return;
				}
				self.mode = MODE.REF;
				self.draw();
				resolve();
			});
		});
	},

	drawNumerator : function() {
		var d = this.div.find('[class^=rdata]:eq(0)');
		try {
			var v = parseInt(d.attr('val'));
		} catch (e) {
			var v = 0;
		}
		d.empty().append(
			$('<div>', {text:(v===0 ? _L('ALL_MEMBER') : v )})
		);
	},

	drawDenominator : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			var d = self.div.find('[class^=rdata]:eq(1)').empty();
			var v = d.attr('val');
			v = v.split(',');
			Util.name(v).then(function(res) {
				for ( var i in res) {
					d.append($('<div>').text(res[i]));
				}
				if (d.children().length===0) {
					d.append($('<div>').text(_L('NOT_SET')));
				}
				resolve();
			}).catch(function(e) {
				UI.alert(e.message);
				reject();
			});
		});
	}
};

