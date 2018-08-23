// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function GovRuleList(div, groupid, cb) {
	this.div = div;
	this.groupid = groupid;
	this.cb = cb;
	this.init();
}

GovRuleList.prototype = {

	init : function() {
		var self = this;
		this.data = [];
		return Util.promise(function(resolve, reject) {
			if (self.groupid===undefined) {
				reject();
				return;
			}
			Rpc.call('rule.list', [{
				groupid : self.data.groupid,
				ver : self.data.ver,
				draftno : self.data.draftno
			}], function(res) {
				resolve(res.result);
			});
		}).then(function(data) {
			self.data = data;
			return self.layout();
		}).catch(function(e) {
			throw e;
		});
	},

	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/govrulelist.html', function() {
				var hd = self.div.find('.hd');
				$(hd[0]).text(_L('NAME1'));
				$(hd[1]).text(_L('RULE'));
				self.draw();
				resolve();
			});
		}, 500);
	},

	draw : function() {
		var self = this;
		var format = function(elm, auth) {
			if (auth === '') {
				$(elm).text(_L('ALL_MEMBER'));
				return;
			}
			auth = auth.split(',');
			Util.name(auth).then(function(data) {
				var disp = [];
				for ( var i in data) {
					disp.push(data[i]);
				}
				$(elm).text(disp.join(', '));
			});
		}
		this.div.addClass('govrulelist');
		var darea = $(this.div.children('.darea'));
		var harea = $(this.div.children('.harea'));
		harea.width(this.div.innerWidth());
		for ( var i in this.data) {
			var d = this.data[i];
			var row = $('<div class="row">').attr({rid: d.id, rname: d.name});
			row.append($('<div>').addClass('col-sm-5 col1').text(d.name));
			row.append($('<div>').addClass('col-sm-2 col2').text(d.req === 0 ? _L('ALL_MEMBER') : d.req));
			row.append($('<div>').addClass('col-sm-1 col2').text('／'));
			var elm = $('<div>').addClass('col-sm-4 col3');
			row.append(elm).click(function() {
				self.cb({
					id : $(this).attr('rid'),
					name : $(this).attr('rname')
				});
			});
			format(elm, d.auth);
			darea.append(row);
		}
	},

	close : function() {
		this.div.remove();
	}
};
