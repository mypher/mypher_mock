// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

_ = {
	init : function() {
		Header.init($('#head')).then(function() {
			Footer.init($('#tail'));
			_.Search.new();
		});
		UI.setMainDiv($('#main'));
	},
	Search : {
		new : function() {
			var search = new Search($('#main'), function(code, v) {
			if (code===NOTIFY.SELECT) {
				if (v.type==='1') {
					_.Cipher.ref(v);
				} else if (v.type==='2') {
					_.Task.ref(v);
				}
			}
			});
			History.run(_L('SEARCH'), search);
		}
	},
	Cipher : {
		ref : function(v) {
			var cipher = new Cipher({
				div : $('#main'),
				mode : MODE.REF,
				key : {
					id: v.id,
					ver : v.ver,
					draftno : v.draftno
				}
			}, function(code, v) {
			/*	if (code===NOTIFY.CANCEL || code===NOTIFY.APPROVE) {
				} else if (code===NOTIFY.CREATE) {
					_.Cipher.create();
				} else if (code===NOTIFY.SELECT) {
					if (v.type===CIPHER_SELECT_TYPE.TASK) {
						History.push(_L('TASK'), function() {
							_.Cipher.select(d);
						});
						_.Task.select(v.d);
					}
				} else if (code===NOTIFY.REDRAW) {
					// TODO:HEADER
				}*/
			});
			History.run(_L('CIPHER'), cipher);
		}
		
	},
	Task : {
		ref : function(v) {
			var task = new Task({
				div : $('#main'),
				mode : MODE.REF,
				key : v
			}, function(code, v) {
			});
			History.run(_L('TASK'), task);
		}
	}
};
/*
{
	init : function() {
		var self = this;
		SearcherManager.init($('#main'), function(code, v) {
			if (code===NOTIFY.SELECT) {
				if (v.type==='1') {
					_.Cipher.init(v);
				} else if (v.type==='2') {
					_.Task.init(v);
				}
			}
		});
		Header.init($('#head'));
		Footer.init($('#tail'));
		_.Search.transit(true);
		_.scroll();
	},

	prepareMenu  : function(isAddSearch, isAddCipher) {
		var menu = [];
		if (isAddSearch) {
			menu.push({
				text : _L('SEARCH'),
				cb : function() {
					_.Search.transit();
				}
			});
		}
		if (isAddCipher && UserManager.isLogin() ) {
			menu.push({
				text : _L('CREATE_CIPHER'),
				cb : function() {
					_.Cipher.create();
				}
			});
		}
		return menu;
	},

	Cipher : {
		init : function(v) {
			History.push(_L('CIPHER'), function() {
				_.Search.draw();
			});
			_.Cipher.select(v);
		},
		select : function(d) {
			_.prepareTransition();
			CipherManager.ref($('#main'), {
				id : d.id,
				ver : d.ver,
				draftno : d.draftno
			}, function(code, v) {
				if (code===NOTIFY.CANCEL || code===NOTIFY.APPROVE) {
				} else if (code===NOTIFY.CREATE) {
					_.Cipher.create();
				} else if (code===NOTIFY.VERSION) {
					History.push(_L('HISTORY1'), function() {
						_.Cipher.select(d);
					});
					_.Cipher.listVersion(d);
				} else if (code===NOTIFY.SELECT) {
					if (v.type===CIPHER_SELECT_TYPE.TASK) {
						History.push(_L('TASK'), function() {
							_.Cipher.select(d);
						});
						_.Task.select(v.d);
					}
				}
			}).then(function(cipher) {
				_.scroll();
				Header.set({
					menu : _.prepareMenu(true, true)
				});
			});
		},
		create : function() {
			CipherManager.add($('#main'), function(code, v) {
				var d = {
					id : v,
					ver : '1',
					draftno : '1'
				};
				if (code===NOTIFY.CREATE) {
					_.Cipher.select(d);
				} else {
					History.push(_L('HISTORY1'), function() {
						_.Cipher.select(d);
					});
					_.Cipher.listVersion(d);
				}
			}).then(function(cipher) {
				_.scroll();
				Header.set({
					menu : _.prepareMenu(true, false)
				});
			});
		},
	
		listVersion : function(d) {
			_.prepareTransition();
			CipherVerManager.ref($('#main'), d.id, function(code, v) {
				if (code===NOTIFY.BACK) {
					History.back();
				} else if (code===NOTIFY.SELECT) {
					History.pop();
					History.pop();
					History.push(_L('CIPHER'));
					_.Cipher.select(v);
				}
			}).then(function(cipher) {
				_.scroll();
				Header.set({
					menu : _.prepareMenu(true, false)
				});
			});
		}
	},
	
	Search : {
		transit : function(noredraw) {
			Header.set({
				menu : _.prepareMenu(false, true)
			});
			if (!noredraw) {
				_.Search.draw();
			}
		},

		draw : function() {
			SearcherManager.draw();
			Header.refresh();
		}
	},

	Task : {
		init : function(v) {
			History.push(_L('CIPHER'), function() {
				_.Search.draw();
			});
			History.push(_L('TASK'), function() {
				_.Cipher.select({id:v.groupid, ver:v.ver, draftno:v.draftno});
			});
			_.Task.select(v);
		},
		select : function(d) {
			_.prepareTransition();
			TaskManager.ref(
				$('#main'), 
				{
					id : d.groupid, 
					ver : d.ver,  
					draftno : d.draftno
				},
				d.id,
				function(code, v) {
					alert(1);
				}
			).then(function() {
				_.scroll();
				Header.set({
					menu : _.prepareMenu(true, true)
				});
			});
		}
	},

	prepareTransition : function() {
		$('#main').empty();
	},

	scroll : function() {
		Footer.scroll();
	}

};
*/

$(function() {
	_.init();
	$(window).on('popstate', function(event) {
	});
	$(window).scroll(function() {
		Footer.scroll();
	});
	$(window).resize(function() {
		Footer.scroll();
	});
});

