function Task(div) {
	this.div = div;
	this.init();
}


Task.prototype = {
	init : function() {
		this.layout();
		this.div.addClass('_tk')
	},

	layout : function() {
		var self = this;
		this.div.load('parts/task.html', function() {
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
			// REWARD
			var span = self.div.find('div[name="tk_reward"] span');
			$(span[0]).text(_L('TOKEN_ID'));
			$(span[2]).text(_L('QUANTITY'));
			// votestate
			var state = self.div.find('.votestate');
			var data1 = {
				n : {
					class : 'tagclr'
				},
				d : {
					class : 'tagclr'
				}
			};
			var data2 = {
				n : {
					class : 'tagclr'
				},
				d : {
					class : 'tagclr'
				}
			}
			this.vote1 = new VoteState($(state[0]), data1);
			this.vote2 = new VoteState($(state[1]), data2);

			// rule 
			var span = self.div.find('div[name="tk_rule"] span');
			$(span[0]).click(function() {
				var div = UI.popup(400, 300);
				//var sel = new RuleSelector(div, data);
			});
			$(span[1]).click(function() {
				alert(1);
			});

		});
	}
};