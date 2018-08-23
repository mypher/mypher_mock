// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

// task.js

function Task(d, cb) {
	this.div = (d.div===undefined) ? UI.getMainDiv() : d.div;
	this.mode = d.mode;
	this.key = d.key;
	this.cipher = d.cipher;
	this.cb = cb;
}

Task.prototype = {
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
		return Util.load(self.div, 'parts/task.html', function(resolve) {
			Util.initDiv(self.div, self.mode, {
				group :[{
					click : function(){
						if (self.mode===MODE.REF) return;
						var div = UI.popup(600, 600);
						var ctrl = new TaskList(div, MODE.REF,
							self.key.groupid,
							self.key.draftno,
							self.key.ver,
							function(code, v) {
								if (code===NOTIFY.SELECT) {
									UI.closePopup();
									self.div.find('div[name="tk_group"] input:eq(0)')
										.val(v.name).prop('tid', v.id);
								}
							}
						);
					}
				}],
				rule : [{
					click : function() {
						if (self.mode===MODE.REF) return;
						var cb = function(code, v) {
							if (code===NOTIFY.SELECT) {
								UI.closePopup();
								self.div.find('div[name="tk_rule"] input:eq(0)')
								.val(v.name).prop('rid', v.id);
							}
						};
						var div = UI.popup(600, 600);
						var ctrl = new RuleList(div, MODE.REF,
							self.key.groupid, self.key.ver, self.key.draftno, cb
						);
					}
				},{
					click : function() {
						var div = UI.popup(600, 200);
						var rid = self.div.find('div[name="tk_rule"] input:eq(0)').prop('rid');
						GovRuleManager.make(div, {
							groupid:self.key.groupid, 
							ver:self.key.ver,
							draftno:self.key.draftno,
							id:rid }, false)
						.then(function(obj){
							
						});
					}
				}],
				reward : [{
					click : function() {
						if (self.mode===MODE.REF) return;
						var div = UI.popup(600, 600);
						var cb = function(code, v) {
							if (code===NOTIFY.SELECT) {
								UI.closePopup();
								self.div.find('div[name="tk_reward"] input:eq(0)')
								.val(v.name).prop('tid', v.id);
							}
						};
						var ctrl = new TokenList(div, MODE.REF,
							self.key.groupid, self.key.ver, self.key.draftno, cb);
					}
				}],
				pic : [{
					click : function() {
						if (self.mode===MODE.REF) return;
						var div = UI.popup(400, 400);
						var inp = self.div.find('div[name="tk_pic"] input:eq(0)');
						var id = inp.prop('pid');
						var list = [];
						if (id) {
							list.push(id);
						}
						var pic = new SelPerson(div, function(l, sel) {
							UI.closePopup();
							if (l) {
								if (sel.length===0) {
									inp.val('').prop('pid', '');
									return;
								}
								Util.name(sel).then(function(ns) {
									for ( var i in ns ) {
										inp.val(ns[i]).prop('pid', i);
									}
								});
							}
						},list);
					}
				}],
				button : []
			});
			resolve();
		});
	},
	load : function() {
		var self = this;
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
				};
			});
		})().then(function() {
			return Util.promise(function(resolve, reject) {
				if (!self.key.id) {
					resolve({});
					return;
				}
				Rpc.call('task.load', [{
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
					resolve(res.result);
				});
			});
		}).then(function(task) {
			self.set(task);
			return Util.promise(function(resolve) {
				resolve();
			});
		});
	},

	set : function(data) {
		var self = this;
		self.task = data;
		Util.setData(this.div, data);
		// REVIEW
		var state = this.div.find('.votestate');
		self.vote1 = new Member(state.eq(0), data.pic_approve, function(){});
		self.vote2 = new Member(state.eq(1), data.review, function(){});
		// BUTTON
		var btns = [];
		var state = data.userstate;
		var vtask = Validator.task;
		var user = UserManager.isLogin() ? UserManager.user().id : '';
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
			if (!vtask.isEditable(self.cipher, data, user).code) {
				btns.push({
					text : 'EDIT',
					click : function() {
						self.edit();
					}
				});
			}
			if (!vtask.canApproveResults(self.cipher, data, user).code) {
				btns.push({
					text : 'REVIEW_APPROVE',
					click : function() {
						self.approve();
					}
				});
			} else if (!vtask.canCancelApprovementResults(self.cipher, data, user).code) {
				btns.push({
					text : 'REVIEW_APPROVE_REV',
					click : function() {
						self.revApprove();
					}
				});
			}
			if (!vtask.canApprovePic(self.cipher, data, user).code) {
				btns.push({
					text : 'PIC_APPROVE',
					click : function() {
						self.approvePic();
					}
				});
			} else if (!vtask.canCancelApprovementPic(self.cipher, data, user).code) {
				btns.push({
					text : 'PIC_APPROVE_REV',
					click : function() {
						self.revApprovePic();
					}
				});
			} else if (!vtask.canApplyToPic(data, user).code) {
				btns.push({
					text : 'APPLY1',
					click : function() {
						self.applyPic();
					}
				});
			} else if (!vtask.canCancelPic(data, user).code) {
				btns.push({
					text : 'CANCEL_APPLY1',
					click : function() {
						self.revApplyPic();
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
		Util.initButton(self.div.find('div[name="tk_button"] button'), btns);
	},

	get : function() {
		var cur = Util.getData(this.div, {
			groupid : this.key.groupid,
			ver : this.key.ver,
			draftno : this.key.draftno,
			pic_approve : (this.task) ? this.task.pic_approve : null,
			review : (this.task) ? this.task.review : null
		});
		return {ini:this.task, cur:cur};
	},

	create : function() {
		var self = this;
		var v = self.get();
		return Util.promise(function(resolve, reject) {
			Rpc.call('task._add', [v.cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.key.id = res.result;
				self.mode = MODE.REF;
				self.draw();
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
	},

	commit : function() {
		var self = this;
		var v = self.get();
		return Util.promise(function(resolve, reject) {
			Rpc.call('task._commit', [v.ini, v.cur], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.mode = MODE.REF;
				self.draw();
				resolve(res.result);
			});
		});
	},

	approve : function() {
		return this.updateStatus('task._approveResults', true);
	},

	revApprove : function() {
		return this.updateStatus('task._approveResults', false);
	},

	approvePic : function() {
		return this.updateStatus('task._approvePic', true);
	},

	revApprovePic : function() {
		return this.updateStatus('task._approvePic', false);
	},

	applyPic : function() {
		return this.updateStatus('task._applyPic', true);
	},

	revApplyPic : function() {
		return this.updateStatus('task._applyPic', false);
	},

	updateStatus : function(m, f) {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call(m, [{
				groupid : self.key.groupid,
				ver : self.key.ver,
				draftno : self.key.draftno,
				id : self.key.id,
				set : f
			}], function(res) {
				if (res.result.code) {
					UI.alert(res.result.code);
					reject();
					return;
				}
				self.draw();
				resolve(res.result);
			});
		});
	}
};

