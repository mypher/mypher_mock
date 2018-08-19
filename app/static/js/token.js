// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function Token(div, data) {
	this.div = div;
	this.data = data;
	this.init();
}

Token.prototype = {
	init : function() {
		this.layout();
	},

	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			this.div.load('parts/token.html', function() {
				resolve();
			});
		}, 500).then(function() {
			return self.draw();
		});
	},

	draw : function() {
		
	}
};
