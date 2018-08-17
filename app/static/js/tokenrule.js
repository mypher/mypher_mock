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
		return Util.load(self.div, 'parts/task.html', function(resolve) {
			Util.initDiv(self.div, self.mode, {
				trigger : [{
					click : function() {
						var div = UI.popup(600, 600);
						var ctrl = new TaskList(div, MODE.REF, 
							self.data.groupid, self.data.ver, self.data.draftno,  
							function(code, v) {
								if (code===NOTIFY.SELECT) {
									var inp = self.div.find(
										'div[name="tr_trigger"] input[type="text"]');
									UI.closePopup();
									$(inp[0]).val(v.name).prop('tid', v.id);
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
										'div[name="tr_trigger"] input[type="text"]');
									UI.closePopup();
									$(inp[1]).val(v.name).prop('tid', v.id);
								}
							}
						);
					}
				}],
				bottom : [{
					text : 'CREATE',
					click : function() {
						self.create();
					}
				}, {
					text : 'CANCEL',
					click : function() {
						self.cancel();
					}
				}]
			});
			self.div.find('select[name="reward_type"]:eq(0)').change(function() {
				var mask = [
					[true,  true],
					[true,  true],
					[false, true],
					[true,  false]
				][parseInt(sel.val())];
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
	load : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
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
			}, function(err) {
				UI.alert(err.message);
				reject();
			});
		});
	},
	set : function(data) {
		this.data = data;
		Util.setData(this.div, data);
	},
	get : function() {
		var cur = Util.getData(this.div, {
			groupid : this.data.groupid,
			ver : this.data.ver,
			draftno : this.data.draftno
		});
		return {ini:this.data, cur:cur};
	},
	create : function() {
		return Util.promise(function(resolve, reject) {
			Rpc.call('token._add', [v], function(res) {
				if (res.result.code) {
					UI.alert(_L(res.result.code));
					reject();
					return;
				}
				self.key.id = res.result;
				self.mode = MODE.REF;
				self.draw();
				resolve();
			}, function(err) {
				UI.alert(err.message);
				reject();
			});
		});
	},
	cancel : function() {
		self.mode = MODE.REF;
		self.draw();
	}

};


/*function TokenRule() {
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
				// type label
				$(labels[3]).text(_L('TYPE'));
				// type
				var root = self.div.find('div[name="tr_type"] > div');
				var radios = root.find('input');
				var spans = root.find('span');
				labels = self.div.find('div[name="tr_type"] > label');
				$(labels[0]).text(_L('REWARD_TYPE'));
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
				root = self.div.find('div[name="tr_trigger"] > div');
				labels = self.div.find('div[name="tr_trigger"] > label');
				$(labels[0]).text(_L('REWARD_REQUIREMENT'));
				var trbtn = root.find('button');
				var sel = $(root.find('select')[0]);
				var selcb = function() {
					var mask = [
						[true,  true],
						[true,  true],
						[false, true],
						[true,  false]
					][sel.val()];
					var inp = self.div.find('div[name="tr_trigger"] input[type="text"]');
					$(trbtn[0]).attr('disabled', mask[0]);
					$(trbtn[1]).attr('disabled', mask[1]);
					$(inp[2]).attr('disabled', mask[1]);
					// tasklist
					if (mask[0]) {
						$(inp[0]).val('');
					}
					// tokenlist
					if (mask[1]) {
						$(inp[1]).val('');
						$(inp[2]).val('');
					}
				};
				$(trbtn[0]).click(function() {
					var div = UI.popup(600, 600);
					var ctrl = new TaskList(div, MODE.REF, 
						self.data.groupid, self.data.ver, self.data.draftno,  
						function(code, v) {
							if (code===NOTIFY.SELECT) {
								var inp = self.div.find('div[name="tr_trigger"] input[type="text"]');
								UI.closePopup();
								$(inp[0]).val(v.name).prop('tid', v.id);
							}
						}
					);
				});
				$(trbtn[1]).click(function() {
					var div = UI.popup(600, 600);
					var ctrl = new TokenList(div, MODE.REF, 
						self.data.groupid, self.data.ver, self.data.draftno,  
						function(code, v) {
							if (code===NOTIFY.SELECT) {
								var inp = self.div.find('div[name="tr_trigger"] input[type="text"]');
								UI.closePopup();
								$(inp[1]).val(v.name).prop('tid', v.id);
							}
						}
					);
				});
				sel.append($('<option>', {value:0}).text(_L('NONE')))
					.append($('<option>', {value:1}).text(_L('BY_REQUEST_OF_OWNER')))
					.append($('<option>', {value:2}).text(_L('BY_COMPLETION_OF_TASK')))
					.append($('<option>', {value:3}).text(_L('BY_NUMBER_OF_OWNED')))
					.change(selcb);
				spans = root.find('span');
				$(spans[0]).text(_L('TASK_ID'));
				$(spans[1]).text(_L('TOKEN_ID'));
				$(spans[2]).text(_L('MINIMUM_TOKEN'));
				selcb();
				// rulelabel
				root = self.div.find('div[name="tr_rulelabel"]');
				labels = root.find('label');
				$(labels[0]).text(_L('TRANSFERED_CONTENT'));
				// rule
				root = self.div.find('div[name="tr_rule"]');
				radios = root.find('input[type="radio"]');
				spans = root.find('span');
				labels = root.find('label');
				$(labels[0]).text(_L('TARGET_CONTENT'));
				$(labels[5]).text(_L('QUANTITY'));
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
			firetype : $(this.div.find('div[name="tr_trigger"] select')[0]).val(),
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
			try {
				for ( var i=0; i<r.length; i++) {
					if (parseInt($(r[i]).val())===parseInt(val)) {
						$(r[i]).click();
						break;
					}
				}
			} catch (e) {
				// nothing
			}
		};
		change('tr_type', v.type);
		if (v.firetype!==undefined) {
			var sel = $(this.div.find('div[name="tr_trigger"] select')[0]);
			sel.val(v.firetype).change();
		}
		change('tr_rule_target', v.rewardtype);
		change('tr_rule_quantity', v.rcalctype);
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
					data : (res.result) ? res.result : {},
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
}; */
