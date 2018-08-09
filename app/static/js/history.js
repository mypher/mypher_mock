// history.js

History = {
	hist : [],

	push : function(label, cb) {
		if (this.hist.length>0) {
			this.hist[this.hist.length-1].cb = cb;
		}
		this.hist.push({label:label});
	},

	back : function() {
		var elm = this.hist.pop();
		elm.cb();
	},
	pop : function() {
		this.hist.pop();
	},

	backTo : function(no) {
		this.hist = this.hist.splice(0,no+1);
	},

	clear : function(d) {
		this.hist = [];
	},

	breadcrumbs : function() {
		var div = $('<div class="bc">');
		var self = this;
		for ( var i=0; i<this.hist.length; i++ ) {
			+ function() {
				var ii = i;
				var elm = self.hist[i];
				if (i<self.hist.length-1) {
					var a = $('<a href="#">').text(elm.label);
					a.click(function() {
						self.backTo(ii);
						elm.cb();
					});
					div.append(a);
					div.append($('<small>').text('»'));
				} else {
					div.append($('<span>').text(elm.label));
				}
			}();
		}
		return div;
	}
};