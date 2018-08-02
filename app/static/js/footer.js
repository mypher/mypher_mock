Footer = {
	HEIGHT : 40,
	init : function(d) {
		this.div = d;
		return this.layout();
	},
	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/footer.html', function(res, status) {
				if (status==='error') {
					self.reject();
				}
				self.div.addClass('footer');
				resolve();
			});
		});
	},
	scroll : function() {
		var bottom = $(document).scrollTop() + $(window).height();
		var height = $(document).height();
		var h = this.HEIGHT - (height-bottom);
		h = (h<0) ? 0 : h;
		this.div.css('height', h + 'px');
	}
};
