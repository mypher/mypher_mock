// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

// cipher.js
// depend on 
//   js/validator/cmn.js
//   js/validator/cipher.js
//   js/common.js
//   js/sha256.js
//   js/lang.js
//   js/sel_person.js
//   js/task.js
//   js/list.js
//   js/member.js
//   js/cipher.js
//   js/user.js
//   js/govrule.js
//   js/tokenrule.js

function Cipher(d,cb) {
	this.div = d.div;
	this.mode = d.mode;
	this.key = d.key;
	this.cb = cb;
}

Cipher.prototype = {
	draw : function() {
		var self = this;
		return self.layout().then(function() {
			return self.load().then(function() {
				return Util.promise(function(resolve) {
					self.cb(NOTIFY.REDRAW);
					resolve();
				});
			});
		});
	},

	layout : function() {
		var self = this;
		return Util.load(self.div, 'parts/cipher.html', function(resolve) {
			Util.initDiv(self.div, self.mode, {
				draft : [{
					click : function() {
						var ctrl = new CipherVer(
							{div:self.div, key:self.key}, 
							function(code, v) {
								if (code===NOTIFY.SELECT) {
									self.mode = MODE.REF;
									self.key = v;
									History.back();
								}
							}
						);
						History.run(_L('HISTORY1'), ctrl);
					}
				}],
				button1 : (function() {
					switch (self.mode) {
					case MODE.NEW: 
						return [
							{
								text : 'CREATE',
								click : function() {
									self.add();
								}
							},
							{
								text : 'CANCEL',
								click : function() {
									History.back();
								}
							}
						];
					case MODE.EDIT: 
						return [
							{
								text : 'COMMIT',
								click : function() {
									self.commit();
								}
							},
							{
								text : 'RELOAD',
								click : function() {
									self.draw();
								}
							}
						];
					default:
						return [];
					}
				})(),
				button2 : [
				]
			});
			resolve();
		});
	},

	save : function() {
	},

	load : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			if (self.mode===MODE.NEW) {
				self.set({});
				resolve();
				return;
			}
			Rpc.call(
				'cipher.load', 
				[{id:self.key.id, ver:self.key.ver, draftno:self.key.draftno}], 
				function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						reject();
						return;
					}
					self.set(res.result);
					resolve(res.result);
				}
			);
		});
	},
	commit : function() {
		var data = this.get();
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('cipher._commit', [data.ini, data.cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.cancel();
				resolve(res.result);
			});
		});
	},
	add : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('cipher._new', [self.get().cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.key = {
					id : res.result,
					ver : '1',
					draftno : '1'
				};
				self.cancel();
				resolve(res.result);
			});
		});
	},

	get : function() {
		var drule = this.drule.get().cur;
		var data = Util.getData(this.div,{
			editor : this.editor.get().join(','),
			drule_req : drule.req,
			drule_auth : drule.auth,
			drule :  this.div.find('div[name="cp_gov"] input:eq(0)').prop('ruleid')
		});
		return {ini:this.data, cur:data};
	},
	set : function(d) {
		var self = this;
		self.data = d;
		d.purpose = self.data.purpose;
		Util.setData(self.div, d);
		// EDITOR
		var ctrl = self.div.find('div[name="cp_editor"] .ctrl:eq(0)');
		if (self.mode===MODE.NEW) {
			var cb = function() {
				var list = UI.popup(400,430);
				var sel = new SelPerson(list, function(ok, sp) {
					UI.closePopup();
					if (ok===true) {
						self.editor.set(sp);
					}
				}, self.editor.get());
			}
		} else {
			var cb = function(){};
		}
		self.editor = new Member(ctrl, d.editor, cb);
		// GOV
		if (self.mode===MODE.NEW) {
			var data = {auth:'', req:0};
		} else {
			var data = {auth:self.data.drule_auth, req:self.data.drule_req};
		}
		self.drule = new GovRule({
			div : self.div.find('div[name="cp_gov"] .ctrl:eq(0)'), 
			data : data,
			mode : self.mode,
			parts : true
		}, function(code, v) {
			// proceed by default definition
			return false;
		});
		self.drule.draw();
		// TOKEN
		ctrl =  self.div.find('div[name="cp_token"] .ctrl:eq(0)');
		new TokenList(ctrl, (self.mode===MODE.REF) ? MODE.REF : MODE.NEW, 
			self.data.id, self.data.ver, self.data.draftno,
			function(code, sel) {
				// proceed by default definition
				return false;
			}
		);
		// TASK
		ctrl = self.div.find('div[name="cp_task"] .ctrl:eq(0)');
		new TaskList(ctrl, (self.mode===MODE.REF) ? MODE.REF : MODE.NEW, 
			self.data.id, self.data.ver, self.data.draftno,
			function(code, sel) {
				// proceed by default definition
				return false;
			}
		);
		// RULELIST
		ctrl = self.div.find('div[name="cp_rulelist"] .ctrl:eq(0)');
		new RuleList(ctrl, (self.mode===MODE.REF) ? MODE.REF : MODE.NEW, 
			self.data.id, self.data.ver, self.data.draftno,
			function(code, sel) {
				// proceed by default definition
				return false;
			}
		);
		// APPROVED
		if (self.mode===MODE.REF) {
			ctrl = self.div.find('div[name="cp_approve"] .ctrl:eq(0)');
			new Member(ctrl, self.data.approved, function(code) {
			});
		}
		// BUTTON2
		if (self.mode===MODE.REF) {
			var user = UserManager.isLogin() ? UserManager.user().id : '';
			var vcipher = Validator.cipher;
			var btns = [];
			if (!vcipher.isEditable(self.data, user).code) {
				btns.push({
					text : 'EDIT',
					click : function() {
						self.edit();
					}
				});
			}
			if (!vcipher.canUseForSource(self.data).code && 
				UserManager.isLogin()) {
				btns.push({
					text : 'NEW_DRAFT',
					click : function() {
						self.newDraft();
					}
				});
			}
			if (!vcipher.canApprove(self.data, user).code) {
				btns.push({
					text : 'APPROVE',
					click : function() {
						self.approve(true);
					}
				});
			} else if (!vcipher.canCancelApprovement(self.data, user).code) {
				btns.push({
					text : 'REVERT_APPROVE',
					click : function() {
						self.approve(false);
					}
				});
			}
			Util.initButton(self.div.find('div[name="cp_button2"] button'), btns);
		} else if (self.mode===MODE.EDIT) {
			Util.initButton(self.div.find('div[name="cp_button2"] button'), 
				[{
					text : 'BACK',
					click : function() {
						self.cancel();
					}
				}]
			);
		}
	},
	approve : function(app) {
		var self = this;
		return Util.promise(function(resolve, reject) {
			var data = self.get().ini;
			Rpc.call('cipher._approve', [{
				id : data.id,
				ver : data.ver,
				draftno : data.draftno,
				approve : app
			}], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.cb(NOTIFY.APPROVE,app);
				self.draw();
				resolve(res.result);
			});
		});
	},

	newDraft : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			var data = self.get().ini;
			Rpc.call('cipher._newdraft', [{
				id : data.id,
				ver : data.ver,
				draftno : data.draftno,
			}], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.key = res.result;
				self.edit();
				resolve(res.result);
			});
		});
	},

	edit : function() {
		this.mode = MODE.EDIT;
		this.draw();
	},

	cancel : function() {
		this.mode = MODE.REF;
		this.draw();
	}
};

