function Task() {
}

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
				var label = self.div.find('label');
				$(label[0]).text(_L('ID'));
				$(label[2]).text(_L('TASK_GROUP'));
				$(label[4]).text(_L('NAME1'));
				$(label[5]).text(_L('DESC'));
				$(label[6]).text(_L('RULE'));
				$(label[7]).text(_L('REWARD'));
				$(label[8]).text(_L('PIC'));
				$(label[9]).text(_L('PIC_APPROVE_STATE'));
				$(label[10]).text(_L('REVIEW_STATE'));
				
				var list = [];
				if (self.mode===MODE.NEW) {
					list = ['tk_id', 'tk_picapprove', 'tk_review'];
					var btn = self.div.find('div[name="tk_button"] button');
					$(btn[0]).text(_L('CREATE')).click(function() {
						self.cb&&self.cb(NOTIFY.CREATE);
					});
					$(btn[1]).text(_L('CANCEL')).click(function() {
						self.cb&&self.cb(NOTIFY.CANCEL);
					});
				} else if (self.mode===MODE.REF) {
					list = ['tk_button'];
					var inp = self.div.find('input');
					var ta = self.div.find('textarea');
					for (var i=0; i<inp.length; i++) {
						$(inp[i]).prop('disabled', true);
					}
					for (var i=0; i<ta.length; i++) {
						$(ta[i]).prop('disabled', true);
					}
				} else {
					list = ['tk_button'];
				}
				for ( var i in list) {
					$($('div[name="' + list[i] + '"]')[0]).css('display', 'none');	
				}
				// rule 
				var btn = self.div.find('div[name="tk_rule"] button');
				$(btn[0]).click(function() {
					if (self.mode===MODE.REF) return;
					var div = UI.popup(400, 300);
					var sel = new GovRuleList(div, self.data.groupid, function(d) {
						var inp = self.div.find('div[name="tk_rule"] input');
						$(inp).val(d.name).attr('rid', d.id);
						UI.closePopup();
					});
				});
				$(btn[1]).click(function() {
					if (self.mode===MODE.REF) return;
					var div = UI.popup(400, 300);
					var inp = self.div.find('div[name="tk_rule"] input');
					var rid = $(inp[0]).attr('rid');
					GovRuleMgr.make(div, {groupid:self.data.groupid, id:rid}, false)
					.then(function(obj){
						
					});
				});
				// REWARD
				var span = self.div.find('div[name="tk_reward"] span');
				$(span[0]).text(_L('TOKEN_ID'));
				$(span[1]).text(_L('QUANTITY'));
				// PIC
				var btn = self.div.find('div[name="tk_pic"] button');
				$(btn[0]).click(function() {
					if (self.mode===MODE.REF) return;
					var div = UI.popup(400, 400);
					var inp = self.div.find('div[name="tk_pic"] input');
					var id = $(inp[0]).attr('pid');
					var list = [];
					if (id) {
						list.push(id);
					}
					var pic = new SelPerson(div, function(l, sel) {
						if (l) {
							Util.name(sel).then(function(ns) {
								for ( var i in ns ) {
									$(inp).val(ns[i]).attr('pid', i);	
								} 
							});
						}
						UI.closePopup();
					},list);
				});
				resolve();
			});
		});
	},

	get : function() {
		var inp = this.div.find('input');
		var ta = this.div.find('textarea');
		this.data = {
			groupid : this.data.groupid,
			ver : this.data.ver,
			draftno : this.data.draftno,
			name : $(inp[0]).val(),
			desc : $(ta[0]).val(),
			ruleid : $(inp[1]).attr('rid'),
			rewardid : $(inp[2]).attr('tid'),
			quantity : $(inp[3]).val(),
			pic : $(inp[4]).attr('pid')
		};
		return this.data;
	},

	set : function(d) {
		this.data = d;
		var label = this.div.find('label');
		var input = this.div.find('input');
		var ta = this.div.find('textarea');
		$(label[1]).text(d.id);
		$(input[0]).val(d.name);
		$(input[1]).attr('rid', d.ruleid).val(d.rname);
		$(input[2]).attr('tid', d.rewardid).val('');
		$(input[3]).val(d.rquantity);
		$(input[4]).attr('pid', d.pic).val(d.pname);
		$(ta[0]).text(d.description);
		// votestate
		var state = this.div.find('.votestate');
		d.auth = Util.split(d.auth);
		var data1 = {
			n : {
				class : 'tagclr',
				list : d.pic_approve
			},
			d : {
				class : 'tagclr',
				auth : d.auth,
				req : d.req
			}
		};
		var data2 = {
			n : {
				class : 'tagclr',
				list : d.review
			},
			d : {
				class : 'tagclr',
				auth : d.auth,
				req : d.req
			}
		}
		this.vote1 = new VoteState($(state[0]), data1);
		this.vote2 = new VoteState($(state[1]), data2);
	}
};


TaskManager = {
	ref : function(div, groupid, ver, draftno, id, cb) {
		var task1 = new Task();
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
					mode : MODE.REF,
					div : div,
					data : res.result.length>0 ? res.result[0] : {},
					cb : cb ? cb : function(code) {
					}
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
			cb : function(code) {
				if (code===NOTIFY.CREATE) {
					var v  = task1.get();
					add(v).then(function(id) {
						cb(code, id);
					});
				} else if (code===NOTIFY.CANCEL) {
					cb(code);
				}
			}
		});
	}
};
