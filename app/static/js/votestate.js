// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function VoteState(div, data) {
	this.div = div;
	this.init(data);
}

VoteState.prototype = {
	init : function(data) {
		data = data||{d:{}, n:{}};
		data.d = data.d||{};
		data.n = data.n||{};
		this.data = data;
		this.layout();
	},

	layout : function() {
		var self = this;
		this.div.load('parts/votestate.html', function() {
			var d = $(self.div.find('div[name="denominator"]')[0]);
			var n = $(self.div.find('div[name="numerator"]')[0]);
			if (Array.isArray(self.data.d.list)) {
				self.denominator = new PersonList(d, self.data.d);
			} else {
				self.denominator = new GovRule(d, self.data.d, false, true);
			}
			self.numerator = new PersonList(n, self.data.n);
		});
	}
};
