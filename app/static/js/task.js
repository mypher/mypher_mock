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
				}, function(err) {
					UI.alert(err.message);
					reject(err.message);
				});
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
				}, function(err) {
					UI.alert(err.message);
					reject(err.message);
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
			}, function(err) {
				UI.alert(err.message);
				reject();
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
			}, function(err) {
				UI.alert(err.message);
				reject();
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
			}, function(err) {
				UI.alert(err.message);
				reject();
			});
		});
	}
};


/*
function Task() {
}

var TASK_APPROVE = {
	NO_AUTH : 0,
	DONE : 1,
	NO : 2,
	APPLYED : 3,
	CANAPPLY : 4
};

var TASK_NOTIFY = {
	CREATE : 0,
	CANCEL : 1,
	PIC_APPROVE : 2,
	PIC_APPROVE_REV : 3,
	RESULTS_APPROVE : 4,
	RESULTS_APPROVE_REV : 5,
	COMMIT : 6,
	APPLY_PIC : 7,
	APPLY_PIC_REV : 8
};

Task.prototype = {
	init : function(p) {
		this.div = p.div.addClass('task');
		this.mode = p.mode;
		this.data = p.data;
		this.cipher = p.cipher;
		this.cb = p.cb;
		var self = this;
		this.layout().then(function() {
			self.set(self.data);
		});
	},

	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/task.html', function() {
				var id = MODE_LABEL[self.mode];
				// ID
				({
					div : $(self.div.find('div[name="tk_id"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('ID'));
					},
					ADD : function() {
						this.div.css('display', 'none');
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					}
				})[id]();
				// GROUP
				({
					div : $(self.div.find('div[name="tk_group"]')[0]),
					common : function(editable) {
						var self2 = this;
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('TASK_GROUP'));
						var onclick = function() {
							if (self.mode===MODE.REF) return;
							var div = UI.popup(600, 600);
							var ctrl = new TaskList(div, MODE.REF,
								self.data.id,
								self.data.draftno,
								self.data.ver,
								function(code, v) {
									if (code===NOTIFY.SELECT) {
										UI.closePopup();
										var inp = self2.div.find('input');
										$(inp[0]).val(v.name).prop('tid', v.id);
									}
								}
							);
						}
						if (editable) {
							var btn = self.div.find('div[name="tk_group"] button');
							$(btn[0]).click(onclick);
						}
					},
					ADD : function() {
						this.common(true);
					},
					REF : function() {
						this.common(false);
					},
					EDIT : function() {
						this.common(true);
					}
				})[id]();
				// NAME
				({
					div : $(self.div.find('div[name="tk_name"]')[0]),
					common : function(editable) {
						var lbl = this.div.find('label');
						var edit = this.div.find('input');
						$(lbl[0]).text(_L('NAME1'));
						$(edit[0]).prop('disabled', !editable);
					},
					ADD : function() {
						this.common(true);
					},
					REF : function() {
						this.common(false);
					},
					EDIT : function() {
						this.common(true);
					}
				})[id]();
				// DESCRIPTION 
				({
					div : $(self.div.find('div[name="tk_desc"]')[0]),
					common : function(editable) {
						var lbl = this.div.find('label');
						var edit = this.div.find('textarea');
						$(lbl[0]).text(_L('DESC'));
						$(edit[0]).prop('disabled', !editable);
					},
					ADD : function() {
						this.common(true);
					},
					REF : function() {
						this.common(false);
					},
					EDIT : function() {
						this.common(true);
					}
				})[id]();
				// RULE
				({
					div : $(self.div.find('div[name="tk_rule"]')[0]),
					common : function(editable) {
						var lbl = this.div.find('label');
						var btn = this.div.find('button');
						if (editable) {
							$(btn[0]).click(function() {
								if (self.mode===MODE.REF) return;
								var cb = function(code, v) {
									if (code===NOTIFY.SELECT) {
										UI.closePopup();
										var inp = self.div.find('div[name="tk_rule"] input');
										$(inp[0]).val(v.name).prop('rid', v.id);
									}
								};
								var div = UI.popup(600, 600);
								var ctrl = new RuleList(div, MODE.REF,
									self.data.groupid, self.data.ver, self.data.draftno, cb
								);
							});
						}
						$(btn[1]).click(function() {
							var div = UI.popup(600, 200);
							var inp = self.div.find('div[name="tk_rule"] input');
							var rid = $(inp[0]).prop('rid');
							GovRuleManager.make(div, {
								groupid:self.data.groupid, 
								ver:self.data.ver,
								draftno:self.data.draftno,
								id:rid }, false)
							.then(function(obj){
								
							});
						});
						$(lbl[0]).text(_L('RULE'));
					},
					ADD : function() {
						this.common(true);
					},
					REF : function() {
						this.common(false);
					},
					EDIT : function() {
						this.common(true);
					}
				})[id]();
				// REWARD
				({
					div : $(self.div.find('div[name="tk_reward"]')[0]),
					common : function(editable) {
						var lbl = this.div.find('label');
						var span = this.div.find('span');
						var btn = this.div.find('button');
						var inp = this.div.find('input');
						$(span[0]).text(_L('TOKEN_ID'));
						$(span[1]).text(_L('QUANTITY'));
						$(lbl[0]).text(_L('REWARD'));
						$(inp[1]).prop('disabled', !editable);
						if (editable) {
							$(btn[0]).click(function() {
								if (self.mode===MODE.REF) return;
								var div = UI.popup(600, 600);
								var cb = function(code, v) {
									if (code===NOTIFY.SELECT) {
										UI.closePopup();
										var inp = self.div.find('div[name="tk_reward"] input');
										$(inp[0]).val(v.name).prop('tid', v.id);
									}
								};
								var ctrl = new TokenList(div, MODE.REF,
									self.data.groupid, self.data.ver, self.data.draftno, cb);
							});
						}
					},
					ADD : function() {
						this.common(true);
					},
					REF : function() {
						this.common(false);
					},
					EDIT : function() {
						this.common(true);
					}
				})[id]();
				// PIC
				({
					div : $(self.div.find('div[name="tk_pic"]')[0]),
					common : function(editable) {
						var lbl = this.div.find('label');
						var btn = this.div.find('button');
						$(lbl[0]).text(_L('PIC'));
						if (editable) {
							$(btn[0]).click(function() {
								if (self.mode===MODE.REF) return;
								var div = UI.popup(400, 400);
								var inp = self.div.find('div[name="tk_pic"] input');
								var id = $(inp[0]).prop('pid');
								var list = [];
								if (id) {
									list.push(id);
								}
								var pic = new SelPerson(div, function(l, sel) {
									UI.closePopup();
									if (l) {
										if (sel.length===0) {
											$(inp).val('').prop('pid', '');
											return;
										}
										Util.name(sel).then(function(ns) {
											for ( var i in ns ) {
												$(inp).val(ns[i]).prop('pid', i);
											}
										});
									}
								},list);
							});
						}
					},
					ADD : function() {
						this.common(true);
					},
					REF : function() {
						this.common(false);
					},
					EDIT : function() {
						this.common(true);
					}
				})[id]();
				// PICAPPROVE
				({
					div : $(self.div.find('div[name="tk_picapprove"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('PIC_APPROVE_STATE'));
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
				// REVIEW
				({
					div : $(self.div.find('div[name="tk_review"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('REVIEW_STATE'));
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
				// BUTTON
				({
					div : $(self.div.find('div[name="tk_button"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('REVIEW_STATE'));
					},
					ADD : function() {
						var btn = this.div.find('button');
						$(btn[0]).css('display', 'none');
						$(btn[1]).text(_L('CREATE')).click(function() {
							self.cb&&self.cb(TASK_NOTIFY.CREATE);
						});
						$(btn[2]).text(_L('CANCEL')).click(function() {
							self.cb&&self.cb(TASK_NOTIFY.CANCEL);
						});
					},
					REF : function() {
						var state = self.data.userstate;
						var btn = this.div.find('button');
						var vtask = Validator.task;
						var user = UserManager.isLogin() ? UserManager.user().id : '';
						if (!vtask.canApproveResults(self.cipher, self.data, user).code) {
							$(btn[1]).text(_L('REVIEW_APPROVE')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.RESULTS_APPROVE);
							});
						} else if (!vtask.canCancelApprovementResults(self.cipher, self.data, user).code) {
							$(btn[1]).text(_L('REVIEW_APPROVE_REV')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.RESULTS_APPROVE_REV);
							});
						} else {
							$(btn[1]).css('display', 'none');
						}
						if (!vtask.canApprovePic(self.cipher, self.data, user).code) {
							$(btn[0]).text(_L('PIC_APPROVE')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.PIC_APPROVE);
							});
						} else if (!vtask.canCancelApprovementPic(self.cipher, self.data, user).code) {
							$(btn[0]).text(_L('PIC_APPROVE_REV')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.PIC_APPROVE_REV);
							});
						} else if (!vtask.canApplyToPic(self.data, user).code) {
							$(btn[0]).text(_L('APPLY1')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.APPLY_PIC);
							});
						} else if (!vtask.canCancelPic(self.data, user).code) {
							$(btn[0]).text(_L('CANCEL_APPLY1')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.APPLY_PIC_REV);
							});
						} else {
								$(btn[0]).css('display', 'none');
						}
						this.common();
					},
					EDIT : function() {
						var btn = this.div.find('button');
						$(btn[0]).css('display', 'none');
						$(btn[1]).text(_L('COMMIT')).click(function() {
							self.cb&&self.cb(TASK_NOTIFY.COMMIT);
						});
						$(btn[2]).text(_L('CANCEL')).click(function() {
							self.cb&&self.cb(TASK_NOTIFY.CANCEL);
						});
					}
				})[id]();
				resolve();
			});
		});
	},

	get : function() {
		var inp = this.div.find('input');
		var ta = this.div.find('textarea');
		var cur = {
			groupid : this.data.groupid,
			ver : this.data.ver,
			draftno : this.data.draftno,
			id : this.data.id,
			parentid : $(inp[0]).prop('tid'),
			name : $(inp[1]).val(),
			description : $(ta[0]).val(),
			ruleid : $(inp[2]).prop('rid'),
			rewardid : $(inp[3]).prop('tid'),
			rquantity : $(inp[4]).val(),
			pic : $(inp[5]).prop('pid'),
			pic_approve : this.data.pic_approve,
			review : this.data.review
		};
		return {ini:this.data, cur:cur};
	},

	set : function(d) {
		this.data = d;
		var label = this.div.find('label');
		var input = this.div.find('input');
		var ta = this.div.find('textarea');
		$(label[1]).text(d.id);
		$(input[0]).prop('tid', d.parentid).val(d.parentname);
		$(input[1]).val(d.name);
		$(input[2]).prop('rid', d.ruleid).val(d.rname);
		$(input[3]).prop('tid', d.rewardid).val(d.rewardname);
		$(input[4]).val(d.rquantity);
		$(input[5]).prop('pid', d.pic).val(d.pname);
		$(ta[0]).text(d.description);
		// votestate
		var state = this.div.find('.votestate');
		this.vote1 = new Member($(state[0]), d.pic_approve, function(){});
		this.vote2 = new Member($(state[1]), d.review, function(){});
	}
};


TaskManager = {
	load : function(d, id) {
		var loadTask = function(dd, id) {
			return Util.promise(function(resolve, reject) {
				if (!id) {
					resolve({cipher:dd,task:{groupid:dd.id, ver:dd.ver, draftno:dd.draftno}});
					return;
				}
				Rpc.call('task.load', [{
					groupid : dd.id,
					ver : dd.ver,
					draftno : dd.draftno,
					id : id
				}], function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						reject();
						return;
					}
					resolve({cipher:dd, task:res.result});
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(fail);
				});
			});
		};
		if (!d.name) {
			return Util.promise(function(resolve, reject) {
				Rpc.call('cipher.load', [{
					id : d.id,
					ver : d.ver,
					draftno : d.draftno
				}], function(res) {
					if (res.result.code) {
						reject(res.result.code);
						return;
					}
					resolve(res.result);
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(fail);
				});
			}).then(function(cipher) {
				return loadTask(cipher, id);
			}).catch(function(e) {
				throw e;
			});
		} else {
			return loadTask(d, id);
		}
	},
	ref : function(div, d, id, cb) {
		var self = this;
		var commit = function(m, f) {
			return Util.promise(function(resolve, reject) {
				Rpc.call(m, [{
					groupid : d.id,
					ver : d.ver,
					draftno : d.draftno,
					id : id,
					set : f
				}], function(res) {
					if (res.result.code) {
						UI.alert(res.result.code);
						reject();
						return;
					}
					resolve(res.result);
				}, function(err) {
					UI.alert(err.message);
					reject();
				}, function(fail) {
					UI.alert(err.message);
					reject();
				});
			});
		};
		var prepare = function(o) {
			var task1 = new Task();
			task1.init({
				mode : MODE.REF,
				div : div,
				data : o.task ? o.task : {},
				cipher : o.cipher ? o.cipher : {},
				cb : function(code, v) {
					var code2 = NOTIFY.CANCEL;
					switch (code) {
					case TASK_NOTIFY.PIC_APPROVE:
						commit('task._approvePic', true);
						code2 = NOTIFY.COMMIT;
						break;
					case TASK_NOTIFY.PIC_APPROVE_REV:
						commit('task._approvePic', false);
						code2 = NOTIFY.COMMIT;
						break;
					case TASK_NOTIFY.RESULTS_APPROVE:
						commit('task._approveResults', true);
						code2 = NOTIFY.COMMIT;
						break;
					case TASK_NOTIFY.RESULTS_APPROVE_REV:
						commit('task._approveResults', false);
						code2 = NOTIFY.COMMIT;
						break;
					case TASK_NOTIFY.APPLY_PIC:
						commit('task._applyPic', true);
						code2 = NOTIFY.COMMIT;
						break;
					case TASK_NOTIFY.APPLY_PIC_REV:
						commit('task._applyPic', false);
						code2 = NOTIFY.COMMIT;
						break;
					case TASK_NOTIFY.CANCEL:
						break;
					default:
						return;
					}
					cb&&cb(code);
				}
			});
		};
		return Util.promise(function(resolve, reject) {
			self.load(d, id).then(function(o) {
				prepare(o);
				resolve();
			}).catch(function(e) {
				reject(e);
			});
		});
	},
	add : function(div, d, cb) {
		var self = this;
		var add = function(v) {
			return Util.promise(function(resolve, reject) {
				Rpc.call('task._add', [v], function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						reject();
						return;
					}
					resolve(res.result);
				}, function(err) {
					self.err = err.message;
					reject();
				}, function(fail) {
					self.err = err.message;
					reject();
				});
			});
		};
		return Util.promise(function(resolve, reject) {
			self.load(d).then(function(o) {
				var task1 = new Task();
				task1.init({
					mode : MODE.NEW,
					div : div,
					data : o.task,
					cipher : o.cipher,
					cb : function(code, v) {
						if (code===TASK_NOTIFY.CREATE) {
							var v  = task1.get().cur;
							add(v).then(function(id) {
								cb&&cb(NOTIFY.CREATE, id);
							});
						} else if (code===NOTIFY.CANCEL) {
							cb&&cb(NOTIFY.CANCEL);
						}
					}
				});
				resolve();
			}).catch (function(e) {
				reject(e);
			});
		});
	},
	edit : function(div, d, id, cb) {
		var self = this;
		var commit = function(v) {
			return Util.promise(function(resolve, reject) {
				Rpc.call('task._commit', [v.ini, v.cur], function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						reject();
						return;
					}
					resolve(res.result);
				}, function(err) {
					self.err = err.message;
					reject();
				}, function(fail) {
					self.err = err.message;
					reject();
				});
			});
		};
		return Util.promise(function(resolve, reject) {
			self.load(d, id).then(function(o) {
				var vtask = Validator.task;
				var user = UserManager.isLogin() ? UserManager.user().id : '';
				if (vtask.isEditable(o.cipher, o.task, user).code) {
					self.ref(div, o.cipher, id, cb).then(function() {
						resolve();
					}).catch(function(e) {
						reject(e);
					});
				} else {
					var task1 = new Task();
					task1.init({
						mode : MODE.EDIT,
						div : div,
						data : o.task,
						cipher : o.cipher,
						cb : function(code, v) {
							if (code===TASK_NOTIFY.COMMIT) {
								var v  = task1.get();
								commit(v).then(function(id) {
									cb&&cb(NOTIFY.COMMIT, id);
								});
							} else if (code===NOTIFY.CANCEL) {
								cb&&cb(NOTIFY.CANCEL);
							}
						}
					});
					resolve();
				}
			}).catch (function(e) {
				reject(e);
			});
		});
	}
};
*/
