Header = {
	init : function(d) {
		this.div = d;
		return this.layout();
	},
	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/header.html', function(res, status) {
				if (status==='error') {
					self.reject();
				}
				var title = $(self.div.find('span[name="title"]')[0]);
				History.init(title);
				self.refresh();
				resolve();
			});
		});
	},

	refresh : function() {
		var ul = $(this.div.find('ul')[0]);
		var duser = $(this.div.find('div[name="user"]')[0]);
		var self = this;
		var addItem = function(label, cb) {
			var a = $('<a class="nav-link" href="#">');
			var li = $('<li class="nav-item">').append(a);
			a.text(label).click(cb);
			ul.append(li);
		};
		ul.empty();
		duser.empty();
		if (this.data) {
			if (this.data.menu) {
				for ( var i in this.data.menu ) {
					+ function() {
						var m = self.data.menu[i];
						addItem(m.text, function() {
							m.cb();
							$(self.div.find('button')[0]).click();
						});
					}();
				}
			}
		}
		// loginform
		if (UserManager.isLogin()) {
			addItem(_L('LOGOUT'), function() {
				self.logout();
			});
		} else {
			addItem(_L('LOGIN'), function() {
				self.login();
			});
		}
	},

	login : function() {
		var self = this;
		var div = UI.popup(600, 600);
		UserManager.login(div, function(code) {
			UI.closePopup();
			self.refresh();
			$(self.div.find('button')[0]).click();
			History.rerun();
		});
	},

	logout : function() {
		UserManager.logout();
		this.refresh();
		$(this.div.find('button')[0]).click();
		History.rerun();
	},

	set : function(l) {
		this.data = l;
		this.refresh();
	}
};

