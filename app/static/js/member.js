// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function Member(div, list, cb) {
	this.div = div;
	this.cb = cb;
	var self = this;
	this.div.addClass('member').click(function() {
		self.cb();
	});
	this.set(list);
}

Member.prototype = {

	draw : function() {
		this.div.empty();
		var found = false;
		for ( var i in this.list ) {
			var div = $('<div>', {'id' : i }).addClass('tag').text(this.list[i]);
			this.div.append(div);
			found = true;
		}
		if (!found) {
			var div = $('<div>', {'id' : i }).addClass('tag').text(_L('NONE'));
			this.div.append(div);
		}
	},

	set : function(list) {
		if (list) {
			if (Array.isArray(list) === false ) {
				list = list.split(',');
			}
		} else {
			list = [];
		}
		var self = this;
		return Util.promise(function(resolve, reject) {
			Util.name(list).then(function(res) {
				self.list = res;
				self.draw();
				resolve();
			});
		});
	},

	get : function() {
		var ret = [];
		for ( var i in this.list ) {
			ret.push(i);
		}
		return ret;
	}
};
