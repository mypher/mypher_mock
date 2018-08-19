// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

_ = {
	search : function() {
		CipherVerManager.ref($('#main'), $('#gid').val(), function(code, v) {
			UI.alert(JSON.stringify(v));
			$('#main').html('');
		});
	},

	login : function() {
		var div = UI.popup(600, 600);
		UserManager.login(div, function(code) {
			if (code===NOTIFY.LOGIN) {
				var user = UserManager.user();
				$('#user').text(user.id);
			}
			UI.closePopup();
		});
	},

	createUser : function() {
		var div = UI.popup(600, 600);
		UserManager.create(div, function(code) {
			UI.closePopup();
		});
	}
};


$(function() {
	$('#search').click(function() {
		_.search();
	});
	$('#login').click(function() {
		_.login();
	});
	$('#creuser').click(function() {
		_.createUser();
	});
});
