// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function SelList(p, cb) {
	this.p = p;
	this.cb = cb;
	this.div = p.div;
	this.layout();
	this.sel = {};
}

var SEL_TYPE_SINGLE = 1;
var SEL_TYPE_MULTIPLE = 2;

var SEL_EVENT_FILTER = 3;
var SEL_EVENT_SELECT = 2;
var SEL_EVENT_OK = 1;
var SEL_EVENT_CANCEL = 0;

SelList.prototype = {
	show : function(data) {
		var col = this.p.col;
		var self = this;
		var key = this.p.key;
		var label = this.p.label;
		var root = $('<div>');
		var html = ['<div><div class="row">'];
		for ( var i=0; i<col.length; i++ ) {
			html.push('<div class="col-sm-' + col[i].width + '">');
			html.push(col[i].label);
			html.push('</div>');
		}
		html.push('</div></div>');
		$(this.div.find('div[name="li_list"]>div')[0]).empty().append($(html.join('')));
		this.lbllist = {};
		for ( var i=0; i<data.length; i++) {
			this.lbllist[data[i][key]] = data[i][label];
			var cls = (this.sel[data[i][key]]) ? ' sel' : ((i%2===1) ? '' : ' odd');
			html = [
				'<div class="row' + cls + 
				'" key="' + data[i][key] + '" label="' + data[i][label] + '">'
			];
			for ( var j=0; j<col.length; j++ ) {
				html.push('<div class="col-sm-' + col[j].width + '"><div>');
				html.push(data[i][col[j].name]);
				html.push('</div></div>');
			}
			html.push('</div>');
			var row = $(html.join(''));
			root.append(row);
			row.click(function() {
				var val = $(this).attr('key');
				if (self.p.type===SEL_TYPE_SINGLE) {
					self.cb(SEL_EVENT_SELECT, [{id:val, name:this.lbllist[val]}]);
				} else {
					self.select(val);
				}
			});
		}
		$(this.div.find('div[name="li_list"]>div')[1]).empty().append(root);
		this.data = data;
	},
	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/sellist.html', function(res, status) {
				if (status==='error') {
					reject();
				}
				var list = $(self.div.find('div[name="li_list"]')[0]);
				if (self.p.type === SEL_TYPE_SINGLE) {
					self.div.find('div[name="li_select"]').css('display', 'none');
					self.div.find('div[name="li_button"]').css('display', 'none');
					list.css('height', (self.div.outerHeight()-100) + 'px');
					$(list.children('div')[1]).css('height', (self.div.outerHeight()-145) + 'px');
				} else {
					list.css('height', (self.div.outerHeight()-230) + 'px');
					$(list.children('div')[1]).css('height', (self.div.outerHeight()-275) + 'px');
				}
				var btn = self.div.find('button');
				$(btn[0]).text(_L('SELECT')).click(function() {
					var sel = []
					for ( var i in self.sel ) {
						sel.push({
							id : i,
							name : self.lbllist[i]
						});
					}
					self.cb(SEL_EVENT_OK, sel);
				});
				$(btn[1]).text(_L('CANCEL')).click(function() {
					self.cb(SEL_EVENT_CANCEL);
					
				});
				var input = self.div.find('input');
				$(input[0]).keypress(function(e) {
					if (e.which === 13 ) {
						self.cb(SEL_EVENT_FILTER, $(input[0]).val());
						return false;
					}
				});
				resolve();
				self.cb(SEL_EVENT_FILTER, '');
			});
		});
	},
	select : function(sel) {
		this.sel[sel] = !(this.sel[sel]);
		this.show(this.data);
		this.showSel();
	},
	showSel : function() {
		var root = $(this.div.find('div[name="li_select"]>div')[0]);
		var self = this;
		root.empty();
		for ( var i in this.sel ) {
			if (this.sel[i]) {
				var elm = $('<div>', {'key' : i}).text(this.lbllist[i]);
				elm.click(function() {
					self.select($(this).attr('key'));
				});
				root.append(elm);
			}
		}
	}
};

function PersonSelList(div, sel, cb) {
	this.sel = sel;
	this.div = div;
	this.cb = cb;
	var type = {
		div : this.div,
		col : [
			{ width : 5, label : 'ID', name : 'id' },
			{ width : 7, label : 'NAME', name : 'name' }
		],
		key : 'id',
		label : 'name',
		type : this.sel
	};
	var self = this;
	this.list = new SelList(type, function(evt, sel) {
		self.onevent(evt, sel);
	});
}

PersonSelList.prototype = {
	onevent : function(evt, sel) {
		if (evt===SEL_EVENT_FILTER) {
			this.filter(sel);
		} else {
			this.cb&&this.cb(evt, sel);
		}
	},
	filter : function(sel) {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('person.list_fast', [sel], function(res) {
				self.list.show(res.result);
				resolve();
			});
		});
	}
};

function TaskSelList(div, sel, gpid, cb) {
	this.sel = sel;
	this.div = div;
	this.gpid = gpid;
	this.cb = cb;
	var type = {
		div : this.div,
		col : [
			{ width : 5, label : 'ID', name : 'id' },
			{ width : 7, label : 'NAME', name : 'name' }
		],
		key : 'id',
		label : 'name',
		type : this.sel
	};
	var self = this;
	this.list = new SelList(type, function(evt, sel) {
		self.onevent(evt, sel);
	});
}

TaskSelList.prototype = {
	onevent : function(evt, sel) {
		if (evt===SEL_EVENT_FILTER) {
			this.filter(sel);
		} else {
			this.cb&&this.cb(evt, sel);
		}
	},
	filter : function(sel) {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('task.list_fast', [self.gpid, sel], function(res) {
				self.list.show(res.result);
				resolve();
			});
		});
	}
};

function TokenSelList(div, sel, gpid, cb) {
	this.sel = sel;
	this.div = div;
	this.gpid = gpid;
	this.cb = cb;
	var type = {
		div : this.div,
		col : [
			{ width : 5, label : 'ID', name : 'id' },
			{ width : 7, label : 'NAME', name : 'name' }
		],
		key : 'id',
		label : 'name',
		type : this.sel
	};
	var self = this;
	this.list = new SelList(type, function(evt, sel) {
		self.onevent(evt, sel);
	});
}

TokenSelList.prototype = {
	onevent : function(evt, sel) {
		if (evt===SEL_EVENT_FILTER) {
			this.filter(sel);
		} else {
			this.cb&&this.cb(evt, sel);
		}
	},
	filter : function(sel) {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('token.list_fast', [self.gpid, sel], function(res) {
				self.list.show(res.result);
				resolve();
			});
		});
	}
};
