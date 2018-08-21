// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function GovRule(d, cb) {
	this.div = (d.div===undefined) ? UI.getMainDiv() : d.div;
	this.mode = d.mode; // REF : display title, REF2 : hide title
	this.key = d.key;
	this.cipher = d.cipher;
	this.hidetitle = d.hidetitle;
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
			resolve();
		});
	},

	load : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('rule.get', [{
					groupid : self.key.groupid, 
					ver : self.key.ver, 
					draftno : self.key.draftno,
					id : self.key.id
			}], function(res) {
				self.set(res.result);
				resolve();
			}, function(err) {
				reject(err.message);
			});
		});
	},

	set : function(data) {
		var self = this;
		self.data = data;
		Util.setData(self.div, data);
		var user = UserManager.isLogin() ? UserManager.user.id : '';
		var btns = [];
		// BUTTON
		switch (self.mode) {
		case MODE.NEW:
			btns.push({
				text : 'CREATE',
				click : function() {
					self.create();
				}
			});
			btns.push({
				text : 'CANCEL',
				click : function() {
					self.cancel();
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
		Util.initButton(self.div.find('div[name="bottom"] button'), btns);
		var td = self.div.find('[class^=rdata]');
		td.eq(0).empty().append(
			$('<div>', {text:(self.data.req===0 ? _L('ALL_MEMBER') : self.data.req )})
		).attr('val', self.data.req).click(function() {
		});
		var base = td.eq(1);
		var auth = {
			true : {},
			false : {class: self.data.class}
		}[self.data.class===undefined];
		for ( var i in self.data.auth) {
			auth.text = self.data.auth[i];
			td.append($('<div>', auth));
		}
		if (td.children().length===0) {
			auth.text = _L('NOT_SET');
			td.append($('<div>', auth));
		}

	},

	get : function() {
		var cur = Util.getData(this.div, {
			groupid : this.key.groupid,
			ver : this.key.ver,
			draftno : this.key.draftno,
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
			}, function(err) {
				UI.alert(err.message);
				reject(err.message);
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
			}, function(err) {
				UI.alert(err.message);
				reject(err.message);
			});
		});
	}
};

/*
function GovRule(div, data, editable, hidetitle, cb) {
	this.div = div;
	this.editable = editable;
	this.hidetitle = hidetitle;
	this.data = data;
	this.cb = cb;
	if (data.auth&&!Array.isArray(data.auth)) {
		data.auth = data.auth.split(',');
	}
	this.init();
	if (data&&data.auth) {
		if (data.auth.length&&data.auth.length>0) {
			var self = this;
			Util.name(data.auth).then(function(names) {
				self.data.auth = names;
				self.layout();
			}).catch(function(err) {
				console.log(err);
				self.data.auth = {};
				self.layout();
			});
		}	
		if (isNaN(parseInt(this.data.req))) {
			this.data.req = 0;
		}
	} else {
		this.data = data || {};
		this.data.req = 0;
		this.data.auth = {};
		this.layout();
	}
}


GovRuleManager = {
	add : function(div, data, cb) {
		return Util.promise(function(resolve, reject) {
			var ctrl = new GovRule(div, data, true, false, function(code) {
				if (code===NOTIFY.COMMIT) {
					var data = ctrl.get();
					data.auth = data.auth.join(',');
					Rpc.call('rule._add', [data], function(res) {
						if (res.result.code) {
							UI.alert(_L(res.result.code));
							return;
						}
						cb(NOTIFY.CREATE, res.result);
					}, function(err) {
						UI.alert(err.message);
					}, function(fail) {
						UI.alert(fail.message);
					});
				} else if (code===NOTIFY.CANCEL) {
					cb(code);
				}
			});
			resolve(ctrl);
		});
	},
	ref : function(div, data, cb) {
		return Util.promise(function(resolve, reject) {
			Rpc.call('rule.get', [{
					groupid : data.groupid, 
					ver : data.ver, 
					draftno : data.draftno,
					id : data.id
				}], function(res) {
				data.req = res.result.req;
				data.name = res.result.name;
				data.auth = res.result.auth.split(',');
				resolve(new GovRule(div, data, false, false, function(code) {
					cb(code);
				}));
			}, function(err) {
				reject(err.message);
			}, function(fail) {
				reject(fail.message);
			});
		});
	},
	make : function(div, data, editable, hidetitle) {
		return Util.promise(function(resolve, reject) {
			if (!data.groupid) {
				reject('data.groupid not specified');
			}
			if (data.id) {
				Rpc.call('rule.get', [{
					groupid : data.groupid, 
					ver : data.ver,
					draftno : data.draftno,
					id : data.id
				}], function(res) {
					data.req = res.result.req;
					data.name = res.result.name;
					data.auth = res.result.auth.split(',');
					resolve(new GovRule(div, data, editable));
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(err.message);
				});
			} else {
				resolve(new GovRule(div, data, editable, hidetitle));
			}
		});
	},

	commit : function(gov) {
		/*return Util.promise(function(resolve, reject) {
			var data = gov.get();
			var auth = Array.isArray(data.auth) ? data.auth.join(',') : '';
			Rpc.call('rule.add', [data.groupid, data.name, data.req, auth], function(res) {
				resolve(res.result);
			}, function(err) {
				reject(err.message);
			}, function(fail) {
				reject(err.message);
			});
		});*/
/*		alert('!!!');

	}
}


GovRule.prototype = {
	init : function() {
	},

	getChildRect : function(w,h) {
		var ws = {
			w : $(window).width(),
			h : $(window).height()
		};
		var ms = {
			lt : this.div.offset(),
			w : this.div.width(),
			h : this.div.height()
		};
		w = (ws.w < w) ? ws.w : w;
		h = (ws.h < h) ? ws.h : h;
		var l = (ms.lt.left + ms.w / 2) - w / 2;
		var t = (ms.lt.top + ms.h / 2) - h / 2;
		l = (l < 0) ? 0 : l;
		t = (t < 0) ? 0 : t;
		return {left:l, top:t, width:w, height:h, position:'fixed'};
	},

	layout : function() {
		var self = this;
		this.div.empty().addClass('govrule').load('parts/govrule.html', function() {
			var td = self.div.find('[class^=td]');
			var span = self.div.find('span');
			var input = self.div.find('input');
			$(span[0]).text(_L('NAME1'));
			var btndiv = self.div.find('.button');
			if (self.hidetitle) {
				var div = self.div.find('div');
				$(div[0]).css('display', 'none')
				$(btndiv[0]).css('display', 'none');
			}
			self.draw();
			if (!self.editable) {
				$(input[0]).attr('disabled', true);
				$(btndiv[0]).css('display', 'none');
				return;
			}
			var btn = $(btndiv[0]).find('button');
			$(btn[0]).text(_L('COMMIT')).click(function() {
				self.cb(NOTIFY.COMMIT);
			});
			$(btn[1]).text(_L('CANCEL')).click(function() {
				self.cb(NOTIFY.CANCEL);
			});
			$(td[0]).click(function() {
				var txt = $('<input>', { type:'text', value:self.data.req });
				txt.css({
					width:$(this).width(),
					height:$(this).height(),
				});
				$(this).empty().append(txt);
				txt.on('blur', function(){
					$(this).remove();
					try {
						self.data.req = parseInt($(this).val());
						self.data.req = isNaN(self.data.req) ? 0 : self.data.req;
					} catch (e) {
						self.data.req = 0;
					}
					self.draw();
				}).focus().select();
			});
			$(td[2]).click(function() {
				var selected = [];
				var auth = UI.popup(400,430);
				for ( var i in self.data.auth ) {
					selected.push(i);
				}
				var sel = new SelPerson(auth, function(ok, sp) {
					if (ok===true) {
						Util.name(sp).then(function(res) {
							self.data.auth = res;
							self.draw();
						}).catch(function(e) {
							self.err = e.message;
							self.draw();
						});
					}
					UI.closePopup();
				}, selected);
			});
			$(input[0]).blur(function() {
				self.data.name = $(this).val();
			});
		});
	},

	draw : function() {
		var td = this.div.find('[class^=td]');
		var input = this.div.find('input');
		$(td[0]).empty().append($('<div>', {text:(this.data.req===0 ? _L('ALL_MEMBER') : this.data.req )}));
		td = $(td[2]).empty();
		$(input[0]).val(this.data.name);
		var self = this;
		var auth = {
			true : {},
			false : {class: this.data.class}
		}[this.data.class===undefined];
		for ( var i in this.data.auth) {
			auth.text = this.data.auth[i];
			td.append($('<div>', auth));
		}
		if (td.children().length===0) {
			auth.text = _L('NOT_SET');
			td.append($('<div>', auth));
		}
	},

	get : function() {
		var input = this.div.find('input');
		var ret = {
			groupid : this.data.groupid,
			ver : this.data.ver,
			draftno : this.data.draftno,
			id : this.data.id,
			name : $(input[0]).val(),
			req : this.data.req,
			auth : []
		};
		for ( var i in this.data.auth ) {
			ret.auth.push(i);
		}
		return ret;
	}
};
*/
