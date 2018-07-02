function TokenRule() {
}

TokenRule.prototype = {
	init : function(p) {
		this.div = p.div;
		this.data = p.data;
		this.mode = p.mode;
		this.cb = p.cb;
		var self = this;
		return this.layout().then(function() {
			self.set(self.data);
		});
	},

	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/tokenrule.html', function() {
				var labels = self.div.find('label');
				if (self.mode===MODE.NEW) {
					$(self.div.find('div[name="tr_id"]')[0]).css('display', 'none');
				} else {
					$(self.div.find('div[name="tr_button"]')[0]).css('display', 'none');
				}
				// ID
				$(labels[0]).text(_L('ID'));
				// title
				$(labels[2]).text(_L('NAME1'));
				// type
				var root = self.div.find('div[name="tr_type"] > div');
				var radios = root.find('input');
				var spans = root.find('span');
				$(labels[3]).text(_L('TYPE'));
				$(spans[0]).text(_L('DIVIDEND'));
					$(radios[0]).attr({
					name : 'tr_type',
					value : 0
				});
				$(spans[1]).text(_L('EXCHANGE'));
				$(radios[1]).attr({
					name : 'tr_type',
						value : 1
				});
				// trigger
				var trbtn = self.div.find('div[name="tr_trigger"] > div button');
				root = self.div.find('div[name="tr_trigger"] > div');
				radios = root.find('input[type="radio"]').change(function() {
					var inp = self.div.find('div[name="tr_trigger"] > div input[type="text"]');
					var s1 = ($(this).val()!=='1');
					var s2 = ($(this).val()!=='2');
					$(trbtn[0]).attr('disabled', s1);
					$(trbtn[1]).attr('disabled', s2);
					$(inp[2]).attr('disabled', s2);
					if (s1) {
						$(inp[0]).val('');
					}
					if (s2) {
						$(inp[1]).val('');
						$(inp[2]).val('');
					}
				});
				$(trbtn[0]).click(function() {
					alert(1);
				});
				$(trbtn[1]).click(function() {
					alert(1);
				});

				spans = root.find('span');
				var inp = root.find('input[type="text"]').attr('disabled', true);
				$(labels[6]).text(_L('TRIGGER_OF_EVENT'));
				$(spans[0]).text(_L('BY_REQUEST_OF_OWNER'));
				$(radios[0]).attr({
					name : 'tr_trigger',
					value : 0
				});
				$(spans[1]).text(_L('BY_COMPLETION_OF_TASK'));
				$(radios[1]).attr({
					name : 'tr_trigger',
					value : 1
				});
				$(spans[2]).text(_L('TASK_ID'));
				$(spans[3]).text(_L('BY_NUMBER_OF_OWNED'));
				$(radios[2]).attr({
					name : 'tr_trigger',
					value : 2
				});
				$(spans[4]).text(_L('TOKEN_ID'));
				$(spans[5]).text(_L('MINIMUM_TOKEN'));
				$(spans[6]).text(_L('NONE'));
				$(radios[3]).attr({
					name : 'tr_trigger',
					value : 3
				});
				// rule
				root = self.div.find('div[name="tr_rule"]');
				radios = root.find('input[type="radio"]');
				spans = root.find('span');
				labels = root.find('label');
				$(labels[0]).text(_L('TRANSFERED_CONTENT'));
				$(labels[1]).text(_L('TARGET_CONTENT'));
				$(labels[6]).text(_L('QUANTITY'));
				$(radios[0]).attr({
					name : 'tr_rule_target',
					value : 0
				});
				$(spans[0]).text(_L('QRCODE'));
				$(radios[1]).attr({
					name : 'tr_rule_target',
					value : 1
				});
				$(spans[1]).text(_L('TOKEN'));
				$(radios[2]).attr({
					name : 'tr_rule_target',
					value : 2
				});
				$(spans[2]).text(_L('CRYPTOCURRENCY'));
				$(radios[3]).attr({
					name : 'tr_rule_target',
					value : 3
				});
				$(spans[3]).text(_L('TRANSFER'));
				$(radios[4]).attr({
					name : 'tr_rule_quantity',
					value : 0
				});
				$(spans[4]).text(_L('SPECIFIED_NUMBER'));
				$(radios[5]).attr({
					name : 'tr_rule_quantity',
					value : 1
				});
				$(spans[5]).text(_L('ISSUED_PER_SPECIFIED'));
				$(spans[6]).text(_L('SPECIFIED_NUMBER'));
				// BUTTON
				var btn = self.div.find('button');
				$(btn[2]).text(_L('CREATE')).click(function() {
					self.cb&&self.cb(NOTIFY.CREATE);
				});
				$(btn[3]).text(_L('CANCEL')).click(function() {
					self.cb&&self.cb(NOTIFY.CANCEL);
				});
				resolve();
			});
		});
	},
	get : function() {
		var inp = this.div.find('input[type="text"]');
		this.data = {
			groupid : this.data.groupid,
			ver : this.data.ver,
			draftno : this.data.draftno,
			name : $(inp[0]).val(),
			type : $(this.div.find('input[name^="tr_type"]:checked')).val(),
			firetype : $(this.div.find('input[name^="tr_trigger"]:checked')).val(),
			taskid : $(inp[1]).prop('tid'),
			tokenid : $(inp[2]).prop('tid'),
			noftoken : $(inp[3]).val(),
			rewardtype : $(this.div.find('input[name^="tr_rule_target"]:checked')).val(),
			rcalctype : $(this.div.find('input[name^="tr_rule_quantity"]:checked')).val(),
			rquantity : $(inp[4]).val()
		};
		return this.data;
	},
	set : function(v) {
		var self = this;
		this.data = v;
		var change = function(name, val) {
			var r = $(self.div.find('input[name^="' + name + '"]'));
			for ( var i=0; i<r.length; i++) {
				if ($(r[i]).val()===val) {
					$(r[i]).prop('checked', true).change();
					break;
				}
			}
		};
		if (v.type) {
			change('tr_type', v.type);
		}
		if (v.trigger) {
			change('tr_trigger', v.firetype);
		}
		if (v.content_target) {
			change('tr_rule_target', v.rewardtype);
		}
		if (v.content_send_type) {
			change('tr_rule_quantity', v.rcalctype);
		}
		var trigger = $(this.div.find('input[name^="tr_trigger"]:checked')).val();
		var inp = this.div.find('input[type="text"]');
		var label = this.div.find('label');
		$(label[1]).text(v.id);
		$(inp[0]).val(v.name);
		$(inp[1]).prop('tid', v.taskid).val(v.taskname);
		$(inp[2]).prop('tid', v.tokenid).val(v.tokenname);
		$(inp[3]).val(v.noftoken);
		$(inp[4]).val(v.rquantity);
	}
};

TokenRuleManager = {
	ref : function(div, groupid, ver, draftno, tokenid, cb) {
		var rule1 = new TokenRule();
		Util.promise(function(resolve, reject) {
			Rpc.call('token.load', [{
				groupid : groupid,
				ver : ver,
				draftno : draftno, 
				id : tokenid
			}], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				rule1.init({
					mode : MODE.REF,
					div : div,
					data : (res.result.length>0) ? res.result[0] : {},
					cb : cb ? cb : function(code) {
						// TODO:¬
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
	ini : function(div, data, cb) {
		var rule1 = new TokenRule();
		rule1.init({
			mode : MODE.REF,
			div : div,
			data : data ? data : {},
			cb : cb ? cb : function(code) {
				// TODO:¬
			}
		});
	},
	add : function(div, groupid, ver, draftno, cb) {
		var rule1 = new TokenRule();
		var add = function(v) {
			return Util.promise(function(resolve, reject) {
				Rpc.call('token._add', [v], function(res) {
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
		rule1.init({
			mode : MODE.NEW,
			div : div,
			data : {
				groupid : groupid,
				ver : ver,
				draftno : draftno
			},
			cb : function(code) {
				if (code===NOTIFY.CREATE) {
					var v  = rule1.get();
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
