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
								var div = UI.popup(900, 500);
								var rule1 = TaskManager.ref(div, self.groupid, self.ver, self.draftno, sel.id);
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

};
