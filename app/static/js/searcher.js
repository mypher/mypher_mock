// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

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
				resolve();
				UI.alert(_L('SEARCH_TARGET_NOT_SET'));
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


