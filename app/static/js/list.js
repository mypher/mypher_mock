NOTIFY_LIST = {
	CREATE : 1,
	DATA : 2,
	SELECT : 3
};


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
						self.cb(NOTIFY_LIST.CREATE);
					});
				} else {
					div.css('display', 'none');
				}
				resolve();
				self.cb(NOTIFY_LIST.DATA);
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
			html.push('<div class="col-sm-' + col[i].width + '"><div>');
			html.push(col[i].label);
			html.push('</div></div>');
		}
		html.push('</div>');
		root.append($(html.join('')));
		// data
		for ( var i in data ) {
			var cls = (i%2===1) ? '' : ' odd';
			html = [
				'<div class="row' + cls + '" key="' + data[i][key] + '">'
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
				self.cb(NOTIFY_LIST.SELECT, {id:val});
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
		key : 'id',
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
	this.list = new List(opt, function(evt, sel) {
		self.onevent(evt, sel);
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
		if (evt===NOTIFY_LIST.DATA) {
			return refresh();
		} else if (evt===NOTIFY_LIST.CREATE) {
			var div = UI.popup(900, 600);
			var rule1 = TokenRuleManager.add(div, this.groupid, this.ver, this.draftno, function(code, v) {
				if (code===NOTIFY.CREATE) {
					UI.closePopup();
					refresh();
				} else if (code===NOTIFY.CANCEL) {
					UI.closePopup();
					refresh();
				}
			});
		} else if (evt===NOTIFY_LIST.SELECT) {
			//var div = UI.popup(900, 600);
			//var rule1 = TokenRuleManager.ref(div, this.groupid, this.ver, this.draftno, sel.id);
			this.cb(NOTIFY.SELECT, {
				groupid : this.groupid,
				ver : this.ver,
				draftno : this.draftno,
				id : sel.id,
				name : this.getName(sel.id)
			});
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
		key : 'id',
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
	this.list = new List(opt, function(evt, sel) {
		self.onevent(evt, sel);
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
		if (evt===NOTIFY_LIST.DATA) {
			return refresh();
		} else if (evt===NOTIFY_LIST.CREATE) {
			var div = UI.popup(800, 500);
			var rule1 = TaskManager.add(div, 
				{ id : this.groupid, 
				  ver : this.ver, 
				  draftno : this.draftno }, 
				function(code, id) {
					if (code===NOTIFY.CREATE || code===NOTIFY.CANCEL) {
						UI.closePopup();
						refresh();
					}
				}
			);
		} else if (evt===NOTIFY_LIST.SELECT) {
			//var div = UI.popup(900, 500);
			//var rule1 = TaskManager.ref(div, this.groupid, this.ver, this.draftno, sel.id);
			this.cb(NOTIFY.SELECT, {
				groupid : this.groupid,
				ver : this.ver,
				draftno : this.draftno,
				id : sel.id,
				name : this.getName(sel.id)
			});
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
		key : 'id',
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
	this.list = new List(opt, function(evt, sel) {
		self.onevent(evt, sel);
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
		if (evt===NOTIFY_LIST.DATA) {
			return refresh();
		} else if (evt===NOTIFY_LIST.CREATE) {
			var div = UI.popup(700, 300);
			var rule1 = GovRuleManager.add(div, {
				groupid : this.groupid, 
				ver : this.ver, 
				draftno  : this.draftno, 
			}, function(code, id) {
				if (code===NOTIFY.CREATE || code===NOTIFY.CANCEL) {
					UI.closePopup();
					refresh();
				}
			});
		} else if (evt===NOTIFY_LIST.SELECT) {
			//var div = UI.popup(700, 300);
			//var rule1 = GovRuleManager.ref(div, {
			//		groupid : this.groupid, 
			//		ver : this.ver, 
			//		draftno : this.draftno, 
			//		id : sel.id
			//	},  function() {
			//	}
			//);
			this.cb(NOTIFY.SELECT, {
				groupid : this.groupid,
				ver : this.ver,
				draftno : this.draftno,
				id : sel.id,
				name : this.getName(sel.id)
			});
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

