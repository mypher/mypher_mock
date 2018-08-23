// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

// tokenrule.js

function TokenRule(d, cb) {
	this.div = (d.div===undefined) ? UI.getMainDiv() : d.div;
	this.mode = d.mode;
	this.key = d.key;
	this.cipher = d.cipher;
	this.cb = cb;
}

TokenRule.prototype = {
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
		return Util.load(self.div, 'parts/tokenrule.html', function(resolve) {
			Util.initDiv(self.div, self.mode, {
				trigger : [{
					click : function() {
						var div = UI.popup(600, 600);
						var ctrl = new TaskList(div, MODE.REF, 
							self.data.groupid, self.data.ver, self.data.draftno,  
							function(code, v) {
								if (code===NOTIFY.SELECT) {
									var inp = self.div.find(
										'div[name="tr_trigger"] input[type="text"]:eq(0)');
									UI.closePopup();
									inp.val(v.name).attr('tid', v.id);
									return true;
								}
							}
						);
					}
				},{
					click : function() {
						var div = UI.popup(600, 600);
						var ctrl = new TokenList(div, MODE.REF, 
							self.data.groupid, self.data.ver, self.data.draftno,  
							function(code, v) {
								if (code===NOTIFY.SELECT) {
									var inp = self.div.find(
										'div[name="tr_trigger"] input[type="text"]:eq(1)');
									UI.closePopup();
									inp.val(v.name).attr('tid', v.id);
									return true;
								}
							}
						);
					}
				}]
			});
			self.div.find('select[name="reward_type"]:eq(0)').change(function() {
				if (self.mode===MODE.REF) return;
				var mask = [
					[true,  true],
					[true,  true],
					[false, true],
					[true,  false]
				][parseInt($(this).val())];
				var inp = self.div.find('div[name="tr_trigger"] input[type="text"]');
				var btn = self.div.find('div[name="tr_trigger"] button');
				btn.eq(0).attr('disabled', mask[0]);
				btn.eq(1).attr('disabled', mask[1]);
				inp.eq(2).attr('disabled', mask[1]);
				// tasklist
				if (mask[0]) {
					inp.eq(0).val('');
				}
				// tokenlist
				if (mask[1]) {
					inp.eq(1).val('');
					inp.eq(2).val('');
				}
			}).change();
			resolve();
		});
	},
	save : function() {
	},
	load : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			if (self.mode===MODE.NEW) {
				resolve();
				self.set({})
				return;
			}
			Rpc.call('token.load', [{
				groupid : self.key.groupid,
				ver : self.key.ver,
				draftno : self.key.draftno, 
				id : self.key.id
			}], function(res) {
				if (res.result.code) {
					UI.alert(res.result.code);
					reject();
					return;
				}
				self.set(res.result);
				resolve();
			});
		});
	},
	set : function(data) {
		var self = this;
		self.data = data;
		Util.setData(self.div, data);
		var btns = [];
		switch (self.mode) {
		case MODE.NEW:
			btns.push({
				text : 'CREATE',
				click : function() {
					self.create();
				}
			});
			btns.push({
				text : 'BACK',
				click : function() {
					History.back();
				}
			});
			break;
		case MODE.EDIT:
			btns.push({
				text : 'COMMIT',
				click : function() {
					self.commit();
				}
			});
			btns.push({
				text : 'CANCEL',
				click : function() {
					self.cancel();
				}
			});
			break;
		case MODE.REF:
			btns.push({
				text : 'BACK',
				click : function() {
					History.back();
				}
			});
			break;
		}
		Util.initButton(self.div.find('div[name="tr_button"] button'), btns);
	},
	cancel : function() {
		this.mode = MODE.REF;
		this.draw();
	},
	get : function() {
		var cur = Util.getData(this.div, {
			groupid : this.key.groupid,
			ver : this.key.ver,
			draftno : this.key.draftno
		});
		return {ini:this.data, cur:cur};
	},
	create : function() {
		var self = this;
		var v = self.get();
		return Util.promise(function(resolve, reject) {
			Rpc.call('token._add', [v.cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
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
			Rpc.call('token._commit', [v.ini, v.cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.mode = MODE.REF;
				self.draw();
				resolve();
			});
		});
	}

};

