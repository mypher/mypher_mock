// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

// searcher.js

function Search(d, cb) {
	this.div = d;
	this.cb = cb;
}

Search.prototype = {
	draw : function() {
		var self = this;
		return self.layout().then(function() {
			return self.list().then(function() {
				return Util.promise(function(resolve) {
					self.cb(NOTIFY.REDRAW);
					resolve();
				});
			});
		});
	},
	layout : function() {
		var self = this;
		return Util.load(self.div, 'parts/searcher.html', function(resolve) {
			// TARGET
			var div = self.div.find('div[name="target"]:eq(0)');
			var label = div.find('label:eq(0)');
			var span = div.find('span');
			var radio = div.find('radio');
			label.text(_L('SEARCH_TARGET'));
			span.eq(0).text(_L('CIPHER'));
			span.eq(1).text(_L('TASK'));
			// SEARCH
			var div = self.div.find('div[name="search"]:eq(0)');
			var label = div.find('label:eq(0)');
			var inp = div.find('input');
			label.text(_L('SEARCH_WORDS'));
			// BUTTON
			var div = self.div.find('div[name="button"]:eq(0)');
			var button = div.find('button:eq(0)');
			button.click(function() {
				self.get();
				self.list();
			}).text(_L('SEARCH'));
			resolve();
		});
	},
	save : function() {
		this.get();
	},
	set : function(d) {
		this.d = d;
		var chk = this.div.find('input[name="r_target"]');
		switch (d.type) {
		case '1':
			chk.eq(0).click();
			break;
		case '2':
			chk.eq(1).click();
		default:
			break;
		}
		this.div.find('div[name="search"] input[type="text"]').eq(0).val(d.text);
	},
	get : function() {
		this.d  = {
			type : this.div.find('input[name="r_target"]:checked').val(),
			text : this.div.find('div[name="search"] input[type="text"]').val()
		};
		return this.d;
	},
	list : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			var method = '';
			var d = self.div.find('div[name="area"]:eq(0)');
			var opt = [
				{},
				{   div : d,
					type : MODE.REF,
					col : [
						{ width : 4, label : _L('NAME1'), name : 'name' },
						{ width : 6, label : _L('PURPOSE'), name : 'purpose' },
						{ width : 2, label : _L('RUNNING'), name : 'running' }
					]
				},
				{   div : d,
					type : MODE.REF,
					col : [
						{ width : 3, label : _L('CIPHER'), name : 'cname' },
						{ width : 3, label : _L('TASK'), name : 'tname' },
						{ width : 6, label : _L('DESC'), name : 'description' }
					]
				}
			];
			// not search yet
			if (!self.d) {
				resolve();
				return;
			}
			switch (self.d.type) {
			case '1':
				method = 'cipher.listbywords';
				break;
			case '2':
				method = 'task.listbywords';
				break;
			default:
				reject();
				return;
			}
			Rpc.call(method, [{
				words : self.d.text
			}], function(res) {
				if (res.result.code) {
					reject(res.result.code);
					return;
				}
				if (self.d.type==='1' ) {
					for ( var i in res.result) {
						var o = res.result[i];
						o.running = o.formal ? '✓' : '';
					}
				}
				self.data = res.result;
				self.type = self.d.type;
				self.listctrl = new List(opt[self.d.type], function(evt, sel) {
					self.onlist(evt, sel);
				});
				resolve();
			}, function(err) {
				UI.alert(err.message);
				reject(err.message);
			});
		});
	},
	onlist : function(evt, sel) {
		var self = this;
		if (evt===NOTIFY.DATA) {
			self.listctrl.show(self.data);
		} else if (evt===NOTIFY.SELECT) {
			if (self.type==='1') {
				self.cb(NOTIFY.SELECT, {
					id : sel.id,
					ver : sel.ver,
					draftno : sel.draftno,
					type : self.type
				});
			} else if (self.type==='2') {
				self.cb(NOTIFY.SELECT, {
					groupid : sel.groupid,
					ver : sel.ver,
					draftno : sel.draftno,
					id : sel.id,
					type : self.type
				});
			}
		}
	}
};


/*
function Searcher(d, cb) {
	this.div = d;
	this.cb = cb;
}

Searcher.prototype = {
	init : function() {
		return this.layout();
	},
	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/searcher.html', function(res, status) {
				if (status==='error') {
					reject();
				}
				// TARGET
				var div = self.div.find('div[name="target"]');
				var label = $(div[0]).find('label');
				var span = $(div[0]).find('span');
				var radio = $(div[0]).find('radio');
				$(label[0]).text(_L('SEARCH_TARGET'));
				$(span[0]).text(_L('CIPHER'));
				$(span[1]).text(_L('TASK'));
				
				// SEARCH
				var div = self.div.find('div[name="search"]');
				var label = $(div[0]).find('label');
				var inp = $(div[0]).find('input');
				$(label[0]).text(_L('SEARCH_WORDS'));

				// BUTTON
				var div = self.div.find('div[name="button"]');
				var button = $(div[0]).find('button');
				$(button[0]).click(function() {
					self.d  = {
						type : self.div.find('input[name="r_target"]:checked').val(),
						text : $(inp[0]).val()
					};
					self.cb(NOTIFY.SEARCH, self.d);
				}).text(_L('SEARCH'));
				resolve();
			});
		});
	},
	redraw : function() {
		this.div.empty();
		this.layout();
		this.set(this.d);
	},
	set : function(d) {
		this.d = d;
		var chk = this.div.find('input[name="r_target"]');
		switch (d.type) {
		case '1':
			$(chk[0]).click();
			break;
		case '2':
			$(chk[1]).click();
		default:
			break;
		}
		$(this.div.find('div[name="search"] input[type="text"]')[0]).val(d.text);
	},
	get : function() {
		this.d  = {
			type : this.div.find('input[name="r_target"]:checked').val(),
			text : this.div.find('div[name="search"] input[type="text"]').val()
		};
		return this.d;
	},
	setList : function(d) {
	}
};



var SearcherManager = {
	searcher : null,
	init : function(d, cb) {
		var self = this;
		this.cb = cb;
		this.div = d;
		var list = function(v) {
			return Util.promise(function(resolve, reject) {
				var method = '';
				d = $(self.div.find('div[name="area"]')[0])
				var opt = [
					{},
					{
						div : d,
						type : MODE.REF,
						key : 'key',
						col : [
							{ width : 4,
							  label : _L('NAME1'),
							  name : 'name' },
							{ width : 6,
							  label : _L('PURPOSE'),
							  name : 'purpose' },
							{ width : 2,
							  label : _L('RUNNING'),
							  name : 'running' }
						]
					},
					{
						div : d,
						type : MODE.REF,
						key : 'key',
						col : [
							{ width : 3,
							  label : _L('CIPHER'),
							  name : 'cname' },
							{ width : 3,
							  label : _L('TASK'),
							  name : 'tname' },
							{ width : 6,
							  label : _L('DESC'),
							  name : 'description' }
						]
					}
				];
				switch (v.type) {
				case '1':
					method = 'cipher.listbywords';
					break;
				case '2':
					method = 'task.listbywords';
					break;
				default:
					reject();
					return;
				}
				Rpc.call(method, [{
					words : v.text
				}], function(res) {
					if (res.result.code) {
						reject(res.result.code);
						return;
					}
					for ( var i in res.result) {
						var o = res.result[i];
						if (v.type==='1') {
							o.key = [o.id, o.ver, o.draftno].join('_');
							o.running = o.formal ? '✓' : '';
						} else if (v.type==='2') {
							o.key = [o.groupid, o.ver, o.draftno, o.id].join('_');
						}
					}
					self.data = res.result;
					self.type = v.type;
					self.list = new List(opt[v.type], function(evt, sel) {
						self.onlist(evt, sel);
					});
					resolve();
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(fail);
				});
			});
		};

		this.searcher = new Searcher(d, function(code, v) {
			if (code===NOTIFY.SEARCH) {
				list(v);
			} else {
				cb(code,v);
			}
		});
		return this.searcher.init();
	},
	set : function(d) {
		this.searcher && this.searcher.set(d);
	},
	get : function() {
		return this.searcher ? this.searcher.get() : {};
	},
	onlist : function(evt, sel) {
		if (evt===NOTIFY_LIST.DATA) {
			this.list.show(this.data);
		} else if (evt===NOTIFY_LIST.SELECT) {
			var data = sel.id.split('_');
			if (this.type==='1') {
				if (data.length!==3) return;
				this.cb(NOTIFY.SELECT, {
					id:data[0],
					ver:data[1],
					draftno:data[2],
					type:this.type
				});
			} else if (this.type==='2') {
				if (data.length!==4) return;
				this.cb(NOTIFY.SELECT, {
					groupid:data[0],
					ver:data[1],
					draftno:data[2],
					id:data[3],
					type:this.type
				});
			}
		}
	},
	draw : function() {
		var d = this.searcher.d;
		var self = this;
		this.init(this.div, this.cb).then(function() {
			self.searcher.set(d);
			self.searcher.cb(NOTIFY.SEARCH, d);
		});
	}
};
*/
