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
	REVIEW_APPROVE : 4,
	REVIEW_APPROVE_REV : 5,
	COMMIT : 6,
	APPLY_PIC : 7,
	APPLY_PIC_REV : 8
};

Task.prototype = {
	init : function(p) {
		this.div = p.div.addClass('task');
		this.data = p.data;
		this.mode = p.mode;
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
								self.data.groupid, self.data.ver, self.data.draftno,
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
						switch (state.pic_approve) {
						case TASK_APPROVE.NO:
							$(btn[0]).text(_L('PIC_APPROVE')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.PIC_APPROVE);
							});
							break;
						case TASK_APPROVE.DONE:
							$(btn[0]).text(_L('PIC_APPROVE_REV')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.PIC_APPROVE_REV);
							});
							break;
						default:
							if (state.apply_pic===TASK_APPROVE.CANAPPLY) {
								$(btn[0]).text(_L('APPLY1')).click(function() {
									self.cb&&self.cb(TASK_NOTIFY.APPLY_PIC);
								});
							} else if (state.apply_pic===TASK_APPROVE.APPLYED) {
								$(btn[0]).text(_L('CANCEL_APPLY1')).click(function() {
									self.cb&&self.cb(TASK_NOTIFY.APPLY_PIC_REV);
								});
							} else {
								$(btn[0]).css('display', 'none');
							}
							break;
						}
						switch (state.review_approve) {
						case TASK_APPROVE.NO:
							$(btn[1]).text(_L('REVIEW_APPROVE')).click(function() {
								self.cb&&self.cb(TASK_NOTIFY.REVIEW_APPROVE);
							});
							break;
						case TASK_APPROVE.DONE:
							$(btn[1]).text(_L('REVIEW_APPROVE_REV')).click(function() {
								self.cb&&self.cb(TASK_NOFITY.REVIEW_APPROVE_REV);
							});
							break;
						default:
							$(btn[1]).css('display', 'none');
							break;
						}
						$(btn[2]).text(_L('BACK')).click(function() {
							self.cb&&self.cb(TASK_NOTIFY.CANCEL);
						});
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
			quantity : $(inp[4]).val(),
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
		$(input[3]).prop('tid', d.rewardid).val('');
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
	ref : function(div, groupid, ver, draftno, id, cb) {
		var task1 = new Task();
		var self = this;
		var base = function(code, v) {
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
			case TASK_NOTIFY.REVIEW_APPROVE:
				commit('task._approveReview', true);
				code2 = NOTIFY.COMMIT;
				break;
			case TASK_NOTIFY.REVIEW_APPROVE_REV:
				commit('task._approveReview', false);
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
		};
		var commit = function(m, f) {
			return Util.promise(function(resolve, reject) {
				Rpc.call(m, [{
					groupid : groupid,
					ver : ver,
					draftno : draftno,
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
		var getState = function(d) {
			var list = [ d.pic_approve ? d.pic_approve.split(',') : [],
						 d.review ? d.review.split(',') : [],
						 d.auth ? d.auth.split(',') : [] ];
			var user = UserManager.isLogin() ? UserManager.user().id : '';
			var found = [];
			for ( var i in list ) {
				var l = list[i];
				found.push(false);
				for ( var j in l ) {
					if (l[j]===user) {
						found[i] = true;
						break;
					}
				}
			}
			var ret = {};
			// if loginuser doesn't have approval authority for a task progress
			if (!found[2]) {
				ret.pic_approve = TASK_APPROVE.NO_AUTH;
				ret.review_approve = TASK_APPROVE.NO_AUTH;
				// if pic is not set, loginuser can apply to pic of this task
				if (!d.pic||d.pic==='') {
					ret.apply_pic = TASK_APPROVE.CANAPPLY;
				} else if (d.pic===user) {
					ret.apply_pic = TASK_APPROVE.APPLYED;
				}
				return ret;
			}
			if (list[0].length===d.req) {
				ret.pic_approve = TASK_APPROVE.NO_AUTH;
			} else {
				ret.pic_approve = found[0] ? TASK_APPROVE.DONE : TASK_APPROVE.NO;
			}
			if (list[1].length===d.req) {
				ret.review_approve = TASK_APPROVE.NO_AUTH;
			} else {
				ret.review_approve = found[1] ? TASK_APPROVE.DONE : TASK_APPROVE.NO;
			}
			return ret;
		};
		Util.promise(function(resolve, reject) {
			Rpc.call('task.load', [{
				groupid : groupid,
				ver : ver,
				draftno : draftno,
				id : id
			}], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				res.result.userstate = getState(res.result);
				task1.init({
					mode : MODE.REF,
					div : div,
					data : res.result ? res.result : {},
					cb : base
				});
				resolve();
			}, function(err) {
				self.err = err.message;
				reject();
			}, function(fail) {
				self.err = err.message;
				reject();
			});
		});
	},
	add : function(div, groupid, ver, draftno, cb) {
		var task1 = new Task();
		var base = function(code, v) {
			if (code===TASK_NOTIFY.CREATE) {
				var v  = task1.get().cur;
				add(v).then(function(id) {
					cb&&cb(NOTIFY.CREATE, id);
				});
			} else if (code===NOTIFY.CANCEL) {
				cb&&cb(NOTIFY.CANCEL);
			}
		};
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
		}
		task1.init({
			mode : MODE.NEW,
			div : div,
			data : {
				groupid : groupid,
				ver : ver,
				draftno : draftno
			}, 
			cb : base
		});
	},
	edit : function(div, groupid, ver, draftno, id, cb) {
		var task1 = new Task();
		var base = function(code, v) {
			if (code===TASK_NOTIFY.COMMIT) {
				var v  = task1.get();
				commit(v).then(function(id) {
					cb&&cb(NOTIFY.COMMIT, id);
				});
			} else if (code===NOTIFY.CANCEL) {
				cb&&cb(NOTIFY.CANCEL);
			}
		};
		var commit= function(v) {
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
		}
		Util.promise(function(resolve, reject) {
			Rpc.call('task.load', [{
				groupid : groupid,
				ver : ver,
				draftno : draftno,
				id : id
			}], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				task1.init({
					mode : MODE.EDIT,
					div : div,
					data : res.result ? res.result : {},
					cb : base
				});
				resolve();
			}, function(err) {
				self.err = err.message;
				reject();
			}, function(fail) {
				self.err = err.message;
				reject();
			});
		});
	}
};
