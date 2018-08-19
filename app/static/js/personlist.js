// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function PersonList(div, obj) {
	this.div = div;
	obj = obj||{};
	this.class = obj.class;
	this.init(obj.list||[]);
}

PersonList.prototype = {
	init : function(list) {
		var self = this;
		if (list.length===0) {
			this.list = [];
			this.layout();
		} else {
			Util.name(list).then(function(names) {
				self.list = names;
				self.layout();
			}).catch(function(err) {
				console.log(err);
				self.list = [];
				self.layout();
			});
		}
		this.div.addClass('personlist');
	},

	layout : function() {
		var cls = this.class ? (' ' + this.class) : '';
		for ( var i in this.list ) {
			this.div.append($('<div>', {text:this.list[i], class:'person' + cls}));
		}
		if (this.list.length===0) {
			this.div.append($('<div>', {text:_L('NOONE'), class:'noone' + cls}));
		}
	}
};
