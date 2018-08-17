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
			}, function(err) {
				UI.alert(err.message);
				reject(err.message);
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
			}, function(err) {
				UI.alert(err.message);
				reject(err.message);
			});
		});
	},

	get : function() {
		var drule = this.drule.get();
		var data = Util.getData(this.div,{
			editor : this.editor.get().join(','),
			drule_req : drule.req,
			drule_auth : drule.auth.join(','),
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
			var data = {}
		} else {
			var data = {auth:self.data.drule_auth, req:self.data.drule_req};
		}
		self.drule = new GovRule(self.div.find('div[name="cp_gov"] .ctrl:eq(0)'), 
					data, (self.mode!==MODE.REF), true);
		// TOKEN
		ctrl =  self.div.find('div[name="cp_token"] .ctrl:eq(0)');
		switch (self.mode) {
		case MODE.REF:
			new TokenList(ctrl, MODE.REF, 
				self.data.id, self.data.ver, self.data.draftno,
				function(evt, sel) {
					if (evt===NOTIFY.SELECT) {
						var div = UI.popup(900, 600);
						var rule1 = TokenRuleManager.ref(
								div, sel.groupid, sel.ver, sel.draftno, sel.id);
					}
				}
			);
			break;
		case MODE.EDIT:
			new TokenList(ctrl, MODE.NEW, 
				self.data.id, self.data.ver, self.data.draftno,
				function(evt, sel) {
					// TODO:
				}
			);
			break;
		default:
			break;
		}
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
		switch (self.mode) {
		case MODE.REF:
			new RuleList(ctrl, (self.mode===MODE.REF) ? MODE.REF : MODE.NEW, 
				self.data.id, self.data.ver, self.data.draftno,
				function(code, sel) {
					if (code===NOTIFY.SELECT) {
						var div = UI.popup(800, 300);
						GovRuleManager.make(div, {
							groupid:self.data.id, 
							ver:self.data.ver,
							draftno:self.data.draftno,
							id:sel.id }, false)
						.then(function(obj){
						});
					}
				}
			);
			break;
		case MODE.EDIT:
			new RuleList(ctrl, (self.mode===MODE.REF) ? MODE.REF : MODE.NEW, 
				self.data.id, self.data.ver, self.data.draftno,
				function(code, sel) {
					if (code===NOTIFY.SELECT) {
						var div = UI.popup(800, 300);
						GovRuleManager.make(div, {
							groupid:self.data.id, 
							ver:self.data.ver,
							draftno:self.data.draftno,
							id:sel.id }, false)
						.then(function(obj){
						});
					}
				}
			);
			break;
		default:
			break;
		}
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
			}, function(err) {
				UI.alert(err.message);
				reject(err.message);
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
			}, function(err) {
				reject(err.message);
			}, function(fail) {
				reject(err.message);
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

/*
function Cipher(d) {
	this.div = d.div;
	this.mode = d.mode;
	this.data = d.data;
	this.cb = d.cb;
}
var CIPHER_APPROVEID = {
	NONE : 0,
	DO : 1,
	REV : 2
};

var CIPHER_SELECT_TYPE = {
	TOKEN : 1,
	RULE : 2,
	TASK : 3
}

Cipher.prototype = {
	init : function() {
		return this.layout();
	},
	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/cipher.html', function(res, status) {
				if (status==='error') {
					reject();
				}
				var id = MODE_LABEL[self.mode];
				// ID
				({
					div : $($('div[name="cp_id"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('ID'));
						$(lbl[1]).text(self.data.id);
					},
					ADD : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('ID'));
						this.div.css('display' , 'none');
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					}
				})[id]();
				// VERSION
				({
					div : $($('div[name="cp_ver"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('VERSION'));
						$(lbl[1]).text(self.data.ver);
					},
					ADD : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('ID'));
						this.div.css('display' , 'none');
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					}
				})[id]();
				// DRAFT
				({
					div : $($('div[name="cp_draft"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						var button = this.div.find('button');
						$(lbl[0]).text(_L('DRAFT_NO'));
						$(lbl[1]).text(self.data.draftno);
						$(button[0]).click(function() {
							self.cb(NOTIFY.VERSION);
						});
					},
					ADD : function() {
						this.div.css('display' , 'none');
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					}
				})[id]();
				// EDITOR
				({
					div : $($('div[name="cp_editor"]')[0]),
					common : function(editable, selected) {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('DRAFT_EDIT_MEMBER'));
						this.ctrl = this.div.find('.ctrl');
						if (editable) {
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
						self.editor = new Member(this.ctrl, self.data.editor, cb);
					},
					ADD : function() {
						this.common(true);
					},
					REF : function() {
						this.common(false);
					},
					EDIT : function() {
						this.common(false);
					}
				})[id]();
				// NAME
				({
					div : $($('div[name="cp_name"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('NAME1'));
						this.edit = $(this.div.find('input')[0]);
					},
					ADD : function() {
						this.common();
					},
					REF : function() {
						this.common();
						this.edit.val(self.data.name).prop('disabled', true);
					},
					EDIT : function() {
						this.common();
						this.edit.val(self.data.name);
					}
				})[id]();
				// DESC
				({
					div : $($('div[name="cp_desc"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('PURPOSE'));
						this.edit = $(this.div.find('textarea')[0]);
					},
					ADD : function() {
						this.common();
					},
					REF : function() {
						this.common();
						this.edit.text(self.data.purpose).prop('disabled', true);
					},
					EDIT : function() {
						this.common();
						this.edit.text(self.data.purpose);
					}
				})[id]();
				// GOV
				({
					div : $($('div[name="cp_gov"]')[0]),
					common : function(ini, data, editable) {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('DECISION_RULE'));
						this.ctrl = this.div.find('.ctrl');
						self.drule = new GovRule(this.ctrl, data, editable, true);
					},
					ADD : function() {
						this.common(false, {}, true);
					},
					REF : function() {
						this.common(
							true, 
							{auth:self.data.drule_auth, req:self.data.drule_req}, 
							false
						);
					},
					EDIT : function() {
						this.common(
							true, 
							{auth:self.data.drule_auth, req:self.data.drule_req}, 
							true
						);
					}
				})[id]();
				// TOKEN 
				({
					div : $($('div[name="cp_token"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('TOKEN'));
						this.ctrl = $(this.div.find('.ctrl')[0]);
					},
					ADD : function() {
						this.div.css('display', 'none');
					},
					REF : function() {
						this.common();
						var list = new TokenList(this.ctrl, MODE.REF, 
							self.data.id, self.data.ver, self.data.draftno,
							function(evt, sel) {
								if (evt===NOTIFY.SELECT) {
									var div = UI.popup(900, 600);
									var rule1 = TokenRuleManager.ref(div, sel.groupid, sel.ver, sel.draftno, sel.id);
								}
							}
						);
					},
					EDIT : function() {
						this.common();
						var list = new TokenList(this.ctrl, MODE.NEW, 
							self.data.id, self.data.ver, self.data.draftno,
							function(evt, sel) {
								if (evt===NOTIFY.SELECT) {
									var div = UI.popup(900, 600);
									var rule1 = TokenRuleManager.ref(div, sel.groupid, sel.ver, sel.draftno, sel.id);
								}
							}
						);
					}
				})[id]();
				// TASK
				({
					div : $($('div[name="cp_task"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('TASK'));
						this.ctrl = $(this.div.find('.ctrl')[0]);
					},
					ADD : function() {
						this.div.css('display', 'none');
					},
					REF : function() {
						this.common();
						var list = new TaskList(this.ctrl, MODE.REF, 
							self.data.id, self.data.ver, self.data.draftno,
							function(evt, sel) {
								self.cb(NOTIFY.SELECT, {
									type : CIPHER_SELECT_TYPE.TASK,
									d : {
										groupid : self.data.id,
										ver : self.data.ver,
										draftno : self.data.draftno,
										id : sel.id
									}
								});
							}
						);
					},
					EDIT : function() {
						this.common();
						var list = new TaskList(this.ctrl, MODE.NEW, 
							self.data.id, self.data.ver, self.data.draftno,
							function(evt, sel) {
								var div = UI.popup(900, 500);
								var rule1 = TaskManager.ref(div, self.groupid, self.ver, self.draftno, sel.id);
							}
						);
					}
				})[id]();
				// RULELIST
				({
					div : $($('div[name="cp_rulelist"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('RULELIST'));
						this.ctrl = $(this.div.find('.ctrl')[0]);
					},
					ADD : function() {
						this.div.css('display', 'none');
					},
					REF : function() {
						this.common();
						var list = new RuleList(this.ctrl, MODE.REF, 
							self.data.id, self.data.ver, self.data.draftno,
								function(code, sel) {
									if (code===NOTIFY.SELECT) {
										var div = UI.popup(800, 300);
										GovRuleManager.make(div, {
											groupid:self.data.id, 
											ver:self.data.ver,
											draftno:self.data.draftno,
											id:sel.id }, false)
										.then(function(obj){
										});
									}
								}
						);
					},
					EDIT : function() {
						this.common();
						var list = new RuleList(this.ctrl, MODE.NEW, 
							self.data.id, self.data.ver, self.data.draftno,
								function(code, sel) {
									if (code===NOTIFY.SELECT) {
										var div = UI.popup(800, 300);
										GovRuleManager.make(div, {
											groupid:self.data.id, 
											ver:self.data.ver,
											draftno:self.data.draftno,
											id:sel.id }, false)
										.then(function(obj){
										});
									}
								}
						);
					}
				})[id]();
				// APPROVED
				({
					div : $($('div[name="cp_approve"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('APPROVE'));
						var ctrl = $(this.div.find('.ctrl')[0]);
						this.approve = new Member(ctrl, self.data.approved, function(code) {
						});
					},
					ADD : function() {
						this.div.css('display', 'none');
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.div.css('display', 'none');
					}
				})[id]();
				// BUTTON1
				({
					set : function(arr) {
						var len = this.btn.length;
						var start = len - arr.length;
						for ( var i=0; i<start; i++ ) {
							$(this.btn[i]).css('display', 'none');
						}
						for ( var i=0; i<arr.length; i++) {
							$(this.btn[start + i]).text(arr[i].text).click(arr[i].cb);
						}
					},
					div : $($('div[name="cp_button1"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						this.btn = this.div.find('button');
					},
					ADD : function() {
						this.common();
						this.set([
							{
								text : _L('CREATE'),
								cb : function() {
									self.cb(NOTIFY.CREATE);
								}
							},
							{
								text : _L('CANCEL'),
								cb : function() {
									self.cb(NOTIFY.CANCEL);
								}
							}
						]);
					},
					REF : function() {
						this.div.css('display', 'none');
					},
					EDIT : function() {
						this.common();
						this.set([
							{
								text : _L('COMMIT'),
								cb : function() {
									self.cb(NOTIFY.COMMIT);
								}
							},
							{
								text : _L('RELOAD'),
								cb : function() {
									self.cb(NOTIFY.CANCEL);
								}
							}
						]);
					}
				})[id]();
				// BUTTON2
				({
					set : function(arr) {
						var len = this.btn.length;
						var start = len - arr.length;
						for ( var i=0; i<start; i++ ) {
							$(this.btn[i]).css('display', 'none');
						}
						for ( var i=0; i<arr.length; i++) {
							$(this.btn[start + i]).text(arr[i].text).click(arr[i].cb);
						}
					},
					div : $($('div[name="cp_button2"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						this.btn = this.div.find('button');
					},
					ADD : function() {
						this.div.css('display', 'none');
					},
					REF : function() {
						this.common();
						var user = UserManager.isLogin() ? UserManager.user().id : '';
						var vcipher = Validator.cipher;
						var btns = [];
						if (!vcipher.isEditable(self.data, user).code) {
							btns.push({
								text : _L('EDIT'),
								cb : function() {
									self.cb(NOTIFY.EDIT);
								}
							});
						}
						if (!vcipher.canUseForSource(self.data).code && 
							UserManager.isLogin()) {
							btns.push({
								text : _L('NEW_DRAFT'),
								cb : function() {
									self.cb(NOTIFY.CREATE);
								}
							});
						}
						if (!vcipher.canApprove(self.data, user).code) {
							btns.push({
								text : _L('APPROVE'),
								cb : function() {
									self.cb(NOTIFY.APPROVE, true);
								}
							});
						} else if (!vcipher.canCancelApprovement(self.data, user).code) {
							btns.push({
								text : _L('REVERT_APPROVE'),
								cb : function() {
									self.cb(NOTIFY.APPROVE, false);
								}
							});
						}
						this.set(btns);
					},
					EDIT : function() {
						this.common();
						this.set([{
							text : _L('BACK'),
							cb : function() {
								self.cb(NOTIFY.CANCEL);
							}
						}]);
					}
				})[id]();
				resolve();
			});
		});
	},
	get : function() {
		var drule = this.drule.get();
		var data = {
			id : this.data.id,
			editor : this.editor.get().join(','),
			ver : this.data.ver,
			draftno : this.data.draftno,
			name : this.div.find('div[name="cp_name"] input').val(),
			purpose : this.div.find('div[name="cp_desc"] textarea').val(),
			drule_req : drule.req,
			drule_auth : drule.auth.join(','),
			drule :  this.div.find('div[name="cp_gov"] input').prop('ruleid')
		};
		return {ini:this.data, cur:data};
	}
};



CipherManager = {
	init : function(div, key, mode, cb) {
		return Util.promise(function(resolve, reject) {
			Rpc.call('cipher.load', [{id:key.id, ver:key.ver, draftno:key.draftno}], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				var cipher = new Cipher({
					div : div,
					mode : mode, 
					data : res.result[0],
					cb : cb
				});
				cipher.init().then(function() {
					resolve(cipher);
				}).catch(function(err) {
					self.err = err.message;
					reject();
				});
			}, function(err) {
				self.err = err.message;
				reject();
			}, function(fail) {
				self.err = fail.message;
				reject();
			});
		});
	},
	add : function(div, cb) {
		return Util.promise(function(resolve, reject) {
			var commit = function() {
				return Util.promise(function(resolve, reject) {
					Rpc.call('cipher._new', [cipher.get().cur], function(res) {
						if (res.result.code) {
							UI.alert(_L(res.result.code));
							reject();
							return;
						}
						resolve(res.result);
					}, function(err) {
						reject(err.message);
					}, function(fail) {
						reject(err.message);
					});
				});
			};
			var cipher = new Cipher({
				div : div,
				mode : MODE.NEW, 
				data : {},
				cb : function(code) {
					if (code===NOTIFY.CREATE) {
						commit().then(function(v) {
							cb(code, v);
						});
					} else {
						cb(code, v);
					}
				}
			});
			cipher.init().then(function() {
				resolve(cipher);
			}).catch(function(err) {
				self.err = err.message;
				reject();
			});
		});
	},
	
	ref_n_edit : function(div, key, cb, mode) {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('cipher.load', [{id:key.id, ver:key.ver, draftno:key.draftno}], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				var data = res.result;
				var cipher = new Cipher({
					div : div,
					mode : mode, 
					data : data,
					cb : cb
				});
				cipher.init().then(function() {
					resolve(cipher);
				}).catch(function(err) {
					self.err = err.message;
					reject();
				});
			}, function(err) {
				self.err = err.message;
				reject();
			}, function(fail) {
				self.err = err.message;
				reject();
			});
		});
	},
	
	ref : function(div, key, cb) {
		var cipher = null;
		var self = this;
		var approve = function(f) {
			return Util.promise(function(resolve, reject) {
				var data = cipher.get().ini;
				Rpc.call('cipher._approve', [{
					id : data.id,
					ver : data.ver,
					draftno : data.draftno,
					approve : f
				}], function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						reject();
						return;
					}
					resolve(res.result);
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(err.message);
				});
			});
		};
		var create = function() {
			return Util.promise(function(resolve, reject) {
				var data = cipher.get().ini;
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
					resolve(res.result);
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(err.message);
				});
			});
		};
		return this.ref_n_edit(div, key, function(code, v) {
			if (code===NOTIFY.APPROVE) {
				approve(v).then(function() {
					cb(code);
				});
			} else if (code===NOTIFY.CREATE) {
				create().then(function(res) {
					cb(code, res);
				});
			} else if (code===NOTIFY.EDIT) {
				self.edit(div, key, cb);
			} else {
				cb(code, v);
			}
		}, MODE.REF).then(function(o) {
			cipher = o;
		});
	},

	edit : function(div, key, cb) {
		var cipher = null;
		var self = this;
		var commit = function() {
			return Util.promise(function(resolve, reject) {
				var data = cipher.get();
				Rpc.call('cipher._commit', [data.ini, data.cur], function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						reject();
						return;
					}
					resolve(res.result);
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(err.message);
				});
			});
		};
		return this.ref_n_edit(div, key, function(code) {
			if (code===NOTIFY.COMMIT) {
				commit().then(function() {
					cb(code);
				});
			} else if (code===NOTIFY.CANCEL) {
				self.ref(div, key, cb);
			} else {
				cb(code);
			}
		}, MODE.EDIT).then(function(o) {
			cipher = o;
		});
	}

} ;
*/
