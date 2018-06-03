function TokenRule(div, no, v) {
	this.div = div;
	this.no = no;
	this.init();
	if (v) {
		this.set(v);
	}
}

TokenRule.prototype = {
	init : function() {
		this.layout();
	},

	layout : function() {
		var self = this;
		this.div.load('parts/tokenrule.html', function() {
			var labels = self.div.find('label');
			// title
			$(labels[0]).text(_L('RULE') + self.no);
			// type
			var root = self.div.find('div[name="tr_type"] > div');
			var radios = root.children('input');
			var spans = root.children('span');
			$(labels[1]).text(_L('TYPE'));
			$(spans[0]).text(_L('DIVIDEND'));
			$(radios[0]).attr({
				name : 'tr_type' + self.no,
				value : 0
			});
			$(spans[1]).text(_L('EXCHANGE'));
			$(radios[1]).attr({
				name : 'tr_type' + self.no,
				value : 1
			});
			// trigger
			root = self.div.find('div[name="tr_trigger"] > div');
			radios = root.find('input[type="radio"]').change(function() {
				var inp = self.div.find('div[name="tr_trigger"] > div input[type="text"]');
				var s1 = ($(this).val()!=='1');
				var s2 = ($(this).val()!=='2');
				$(inp[0]).attr('disabled', s1);
				$(inp[1]).attr('disabled', s2);
				$(inp[2]).attr('disabled', s2);
				if (s1) {
					$(inp[0]).val('');
				}
				if (s2) {
					$(inp[1]).val('');
					$(inp[2]).val('');					
				}
			});
			spans = root.find('span');
			var inp = root.find('input[type="text"]').attr('disabled', true);
			$(labels[2]).text(_L('TRIGGER_OF_EVENT'));
			$(spans[0]).text(_L('BY_REQUEST_OF_OWNER'));
			$(radios[0]).attr({
				name : 'tr_trigger' + self.no,
				value : 0
			});
			$(spans[1]).text(_L('BY_COMPLETION_OF_TASK'));
			$(radios[1]).attr({
				name : 'tr_trigger' + self.no,
				value : 1
			});
			$(spans[2]).text(_L('TASK_ID'));
			$(spans[3]).text(_L('BY_NUMBER_OF_OWNED'));
			$(radios[2]).attr({
				name : 'tr_trigger' + self.no,
				value : 2
			});
			$(spans[4]).text(_L('TOKEN_ID'));
			$(spans[5]).text(_L('MINIMUM_TOKEN'));
			$(spans[6]).text(_L('NONE'));
			$(radios[3]).attr({
				name : 'tr_trigger' + self.no,
				value : 3
			});
			// rule
			root = self.div.find('div[name="tr_rule"]');
			radios = root.find('input[type="radio"]');
			spans = root.find('span');
			$(labels[3]).text(_L('TRANSFERED_CONTENT'));
			$(labels[4]).text(_L('TARGET_CONTENT'));
			$(labels[5]).text(_L('QUANTITY'));
			$(radios[0]).attr({
				name : 'tr_rule_target' + self.no,
				value : 0
			});
			$(spans[0]).text(_L('QRCODE'));
			$(radios[1]).attr({
				name : 'tr_rule_target' + self.no,
				value : 1
			});
			$(spans[1]).text(_L('TOKEN'));
			$(radios[2]).attr({
				name : 'tr_rule_target' + self.no,
				value : 2
			});
			$(spans[2]).text(_L('CRYPTOCURRENCY'));
			$(radios[3]).attr({
				name : 'tr_rule_target' + self.no,
				value : 3
			});
			$(spans[3]).text(_L('TRANSFER'));
			$(radios[4]).attr({
				name : 'tr_rule_quantity' + self.no,
				value : 0
			});
			$(spans[4]).text(_L('SPECIFIED_NUMBER'));
			$(radios[5]).attr({
				name : 'tr_rule_quantity' + self.no,
				value : 1
			});
			$(spans[5]).text(_L('ISSUED_PER_SPECIFIED'));
			$(spans[6]).text(_L('SPECIFIED_NUMBER'));
		});
	},
	get : function() {
		var inp = this.div.find('input[type="text"]');
		return {
			type : $(this.div.find('input[name^="tr_type"]:checked')).val(),
			trigger : $(this.div.find('input[name^="tr_trigger"]:checked')).val(),
			trigger_val1 : $(inp[0]).val()||$(inp[1]).val(),
			trigger_val2 : $(inp[2]).val(),
			content_target : $(this.div.find('input[name^="tr_rule_target"]:checked')).val(),
			content_send_type : $(this.div.find('input[name^="tr_rule_quantity"]:checked')).val(),
			content_quantity : $(inp[3]).val()
		}
	},
	set : function(v) {
		var self = this;
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
			change('tr_trigger', v.trigger);
		}
		if (v.content_target) {
			change('tr_rule_target', v.content_target);
		}
		if (v.content_send_type) {
			change('tr_rule_quantity', v.content_send_type);
		}
		var trigger = $(this.div.find('input[name^="tr_trigger"]:checked')).val();
		var inp = this.div.find('input[type="text"]');
		if (trigger==='1') {
			if (v.trigger_val1) {
				$(inp[0]).val(v.trigger_val1);
			}
		} else if (trigger==='2') {
			if (v.trigger_val1) {
				$(inp[1]).val(v.trigger_val1);
			}
			if (v.trigger_val2) {
				$(inp[2]).val(v.trigger_val2);
			}
		}
		if (v.content_quantity) {
			$(inp[3]).val(v.content_quantity);
		}
	}
};