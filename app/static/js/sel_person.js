function SelPerson(div, cb, selected) {
	this.div = div;
	this.list = [];
	this.init();
	this.selected = {};
	if (selected.length&&selected.length>0) {
		var self = this;
		for ( var i=0; i<selected.length; i++) {
			this.selected[selected[i]] = 'name not found';
		}
		Util.name(selected).then(function(res) {
			self.selected = res;
			self.drawSelected();
		}).catch(function(e) {
			self.err = e.message;
		});
	}
	if (typeof(cb)==='function') {
		this.cb = cb;
	}
}

SelPerson.prototype = {
	init : function() {
		this.layout();	
		this.get('');
	},

	layout : function() {
		var list = $('<div class="list">');
		var text = $('<input type="text" class="filter">');
		var selected = $('<div class="ed">');
		var btn_ok = $('<input type="button" class="ok" value="決定">');
		var btn_cancel = $('<input type="button" class="cancel" value="キャンセル">');
		var self = this;
		this.div.empty();
		this.div.addClass('selp')
		this.div.append(list);
		this.div.append(text);
		this.div.append(selected);
		this.div.append(btn_ok);
		this.div.append(btn_cancel);
		text.blur(() => {
			self.get($(text).val());
		}).focus();
		btn_ok.click(function() {
			var ret = [];
			for ( var i in self.selected) {
				if (self.selected[i]) ret.push(i);
			}
			self.cb(true, ret);
		});
		btn_cancel.click(function() {
			self.cb(false);
		});
	},

	get : function(p) {
		this.data = [];
		var self = this;
		Rpc.call('person.list_fast', [p], function(res) {
			self.list = res.result;
			self.refresh();
		}, function(err) {
			self.err = err.message;
		}, function(fail) {
			self.err = err.message;
		});
	},

	refresh : function() {
		var list = $(this.div.children('.list')[0]);
		var tb = $('<div class="tb"></div>');
		var self = this;
		list.empty();
		list.append(tb);
		tb.append($('<div class="hrow"><div class="hcol1">ID</div><div class="hcol2">NAME</div></div>'));
		for ( var i=0; i<this.list.length; i++) {
			var elm = this.list[i];
			var f = i%2;
			var row = $([
				'<div class="row',
				(this.selected[elm.id]) ? ' sel' : '',
				'" val1="' + elm.id + '" val2="' + elm.name + '">',
				'<div class="col1' + f + '">' + elm.id + '</div>',
				'<div class="col2' + f + '">' + elm.name+ '</div>',
				'</div>'
			].join(''));
			row.click(function() {
				self.toggle($(this).attr('val1'), $(this).attr('val2'));
			});
			tb.append(row);
		}
	},

	toggle : function(id, name) {
		this.selected[id] = this.selected[id] ? 0 : name;
		var row = $('.row[val1="' + id + '"]');
		if (row.length!==1) {
			return;
		}
		row = row[0];
		if ( this.selected[id] ) {
			$(row).addClass('sel');
		} else {
			$(row).removeClass('sel');
		}
		this.drawSelected();
	},

	drawSelected : function() {
		var self = this;
		var ed = $(this.div.children('.ed')[0]);
		ed.empty();
		for ( var i in this.selected) {
			var name = this.selected[i];
			if (name) {
				var tag = $('<div class="tag" val="' + i 
							+ '">' + name + '</div>');
				ed.append(tag);
				tag.click(function() {
					self.toggle($(this).attr('val'),'');
				});
			}
		}
	}
};