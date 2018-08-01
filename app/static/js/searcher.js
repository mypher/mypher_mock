// searcher.js

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
							{ width : 8,
							  label : _L('PURPOSE'),
							  name : 'purpose' }
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
