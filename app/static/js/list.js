// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function List(type, cb) {
	this.div = type.div;
	this.type = type.type;
	this.col = type.col;
	this.key = type.key;
	this.cb = cb;
	this.layout();
}

List.prototype = {
	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/list.html', function(res,status) {
				// LIST
				var div = self.div.find('div[name="li_list"]');
				// BUTTON
				div = self.div.find('div[name="li_button"]');
				if (self.type===MODE.NEW) {
					var btn = $(div[0]).find('button');
					$(btn[0]).text(_L('CREATE')).click(function() {
						self.cb(NOTIFY.CREATE);
					});
				} else {
					div.css('display', 'none');
				}
				resolve();
				self.cb(NOTIFY.DATA);
			});
		});
	},

	show : function(data) {
		var root = $(this.div.find('div[name="li_list"]')).empty();
		var col = this.col;
		var key = this.key;
		var self = this;
		// header
		var html = ['<div class="row li_head">'];
		for ( var i=0; i<col.length; i++ ) {
			html.push('<div class="col-' + col[i].width + '"><div>');
			html.push(col[i].label);
			html.push('</div></div>');
		}
		html.push('</div>');
		root.append($(html.join('')));
		// data
		self.data = data;
		for ( var i in data ) {
			var cls = (i%2===1) ? '' : ' odd';
			html = [
				'<div class="row' + cls + '" key="' + i + '">'
			];
			for ( var j=0; j<col.length; j++ ) {
				html.push('<div class="col-' + col[j].width + '"><div>');
				html.push(data[i][col[j].name]);
				html.push('</div></div>');
			}
			html.push('</div>');
			var row = $(html.join(''));
			root.append(row);
			row.click(function() {
				var val = $(this).attr('key');
				self.cb(NOTIFY.SELECT, data[val]);
			});
		}
	}
	
};

function TokenList(div, type, gid, ver, draftno, cb) {
	this.div = div;
	this.cb = cb;
	this.groupid = gid;
	this.ver = ver;
	this.draftno = draftno;
	var opt = {
		div : div,
		type : type,
		col : [
			{
				width : 5,
				label : _L('ID'),
				name : 'id'
			},
			{
				width : 7,
				label : _L('NAME1'),
				name : 'name'
			}
		]
	};
	var self = this;
	this.list = new List(opt, function(code, sel) {
		if (self.cb&&self.cb(code, sel)===true) return;
		self.onevent(code, sel);
	});
}


TokenList.prototype = {
	onevent : function(evt, sel) {
		var self = this;
		var refresh = function() {
			return Util.promise(function(resolve, reject) {
				Rpc.call('token.list_fast', [{
					groupid : self.groupid, 
					ver : self.ver,
					draftno : self.draftno,
					name : ''
				}], function(res) {
					self.data = res.result;
					self.list.show(res.result);
					resolve();
				}, function(err) {
					reject(err.message);
				}, function(err) {
					reject(err.message);
				});
			});
		};
		if (evt===NOTIFY.DATA) {
			return refresh();
		} else if (evt===NOTIFY.CREATE) {
			var token = new TokenRule({
				key : {
					groupid : this.groupid,
					ver : this.ver,
					draftno : this.draftno
				},
				mode : MODE.NEW
			});
			History.run(_L('TOKEN'), token);
		} else if (evt===NOTIFY.SELECT) {
			var token = new TokenRule({
				key : {
					groupid : this.groupid,
					ver : this.ver,
					draftno : this.draftno,
					id : sel.id
				},
				mode : MODE.REF
			});
			History.run(_L('TOKEN'), token);
		}
	},
	getName : function(id) {
		if (this.data===undefined) return '';
		for ( var i in this.data ) {
			if (this.data[i].id===id) {
				return this.data[i].name;
			}
		}
	}
};

function TaskList(div, type, gid, ver, draftno, cb) {
	this.div = div;
	this.cb = cb;
	this.groupid = gid;
	this.ver = ver;
	this.draftno = draftno;
	var opt = {
		div : div,
		type : type,
		col : [
			{
				width : 5,
				label : _L('ID'),
				name : 'id'
			},
			{
				width : 7,
				label : _L('NAME1'),
				name : 'name'
			}
		]
	};
	var self = this;
	this.list = new List(opt, function(code, sel) {
		if (self.cb&&self.cb(code, sel)===true) return;
		self.onevent(code, sel);
	});
}


TaskList.prototype = {
	onevent : function(evt, sel) {
		var self = this;
		var refresh = function() {
			return Util.promise(function(resolve, reject) {
				Rpc.call('task.list_fast', [{
					groupid : self.groupid, 
					ver : self.ver,
					draftno : self.draftno,
					name : ''
				}], function(res) {
					self.data = res.result;
					self.list.show(res.result);
					resolve();
				}, function(err) {
					reject(err.message);
				}, function(err) {
					reject(err.message);
				});
			});
		};
		if (evt===NOTIFY.DATA) {
			return refresh();
		} else if (evt===NOTIFY.CREATE) {
			var task = new Task({
				key : {
					groupid : this.groupid,
					ver : this.ver,
					draftno : this.draftno,
					id : sel.id
				},
				mode : MODE.REF
			});
			History.run(_L('TASK'), task);
		}
	},
	getName : function(id) {
		if (this.data===undefined) return '';
		for ( var i in this.data ) {
			if (this.data[i].id===id) {
				return this.data[i].name;
			}
		}
	}
};


function RuleList(div, type, gid, ver, draftno, cb) {
	this.div = div;
	this.cb = cb;
	this.groupid = gid;
	this.ver = ver;
	this.draftno = draftno;
	var opt = {
		div : div,
		type : type,
		col : [
			{
				width : 5,
				label : _L('ID'),
				name : 'id'
			},
			{
				width : 7,
				label : _L('NAME1'),
				name : 'name'
			}
		]
	};
	var self = this;
	this.list = new List(opt, function(code, sel) {
		if (self.cb&&self.cb(code, sel)===true) return;
		self.onevent(code, sel);
	});
}


RuleList.prototype = {
	onevent : function(evt, sel) {
		var self = this;
		var refresh = function() {
			return Util.promise(function(resolve, reject) {
				Rpc.call('rule.list_fast', [{
					groupid : self.groupid, 
					ver : self.ver,
					draftno : self.draftno, 
					name : ''
				}], function(res) {
					self.data = res.result;
					self.list.show(res.result);
					resolve();
				}, function(err) {
					reject(err.message);
				}, function(err) {
					reject(err.message);
				});
			});
		};
		if (evt===NOTIFY.DATA) {
			return refresh();
		} else if (evt===NOTIFY.CREATE) {
			var rule = new GovRule({
				key : {
					groupid : this.groupid,
					ver : this.ver,
					draftno : this.draftno
				},
				mode : MODE.NEW
			});
			History.run(_L('GOVRULE'), rule);
		} else if (evt===NOTIFY.SELECT) {
			var rule = new GovRule({
				key : {
					groupid : this.groupid,
					ver : this.ver,
					draftno : this.draftno,
					id : sel.id,
					name : this.getName(sel.id)
				},
				mode : MODE.REF
			});
			History.run(_L('GOVRULE'), rule);
		}
	},
	getName : function(id) {
		if (this.data===undefined) return '';
		for ( var i in this.data ) {
			if (this.data[i].id===id) {
				return this.data[i].name;
			}
		}
	}
};

