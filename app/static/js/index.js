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

