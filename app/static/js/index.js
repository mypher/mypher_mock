_ = {
	init : function() {
		var self = this;
		SearcherManager.init($('#main'), function(code, v) {
			if (code===NOTIFY.SELECT) {
				if (v.type==='1') {
					self.selectCipher(v);
				} else if (v.type==='2') {
					self.selectTask(v);
				}
			}
		});
		Header.init($('#head'), function() {
			_.init();
		});
		Footer.init($('#tail'));
		_.trans2Search(true);
		_.scroll();
	},

	prepareMenu  : function(isAddSearch, isAddCipher) {
		var menu = [];
		if (isAddSearch) {
			menu.push({
				text : _L('SEARCH'),
				cb : function() {
					_.trans2Search();
				}
			});
		}
		if (isAddCipher && UserManager.isLogin() ) {
			menu.push({
				text : _L('CREATE_CIPHER'),
				cb : function() {
					_.createCipher();
				}
			});
		}
		return menu;
	},

	selectCipher : function(d) {
		_.prepareTransition();
		CipherManager.ref($('#main'), {
			id : d.id,
			ver : d.ver,
			draftno : d.draftno
		}, function(code, v) {
			if (code===NOTIFY.CANCEL || code===NOTIFY.APPROVE) {
			} else if (code===NOTIFY.CREATE) {
				_.edit();
			}
		}).then(function(cipher) {
			_.scroll();
			Header.set({
				title : _L('CIPHER'),
				menu : _.prepareMenu(true, true)
			});
		});
	},

	trans2Search : function(noredraw) {
		Header.set({
			title : _L('SEARCH'),
			menu : _.prepareMenu(false, true)
		});
		if (!noredraw) {
			SearcherManager.draw();
		}
	},

	createCipher : function() {
		CipherManager.add($('#main'), function(code, v) {
			if (code===NOTIFY.CREATE) {
				_.selectCipher({id:v, ver:'1', draftno:'1'});
			}
		}).then(function(cipher) {
			_.scroll();
			Header.set({
				title : _L('CIPHER'),
				menu : _.prepareMenu(true, false)
			});
		});
	},

	selectTask : function(d) {
		alert('selectTask');
	},

	prepareTransition : function() {
		$('#main').empty();
	},

	scroll : function() {
		Footer.scroll();
	}

};

$(function() {
	_.init();
	$(window).on('popstate', function(event) {
	});
	$(window).scroll(function() {
		_.scroll();
	});
	$(window).resize(function() {
		_.scroll();
	});
});

