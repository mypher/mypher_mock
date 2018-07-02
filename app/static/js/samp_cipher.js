_ = {
	add : function() {
		var obj = null;
		CipherManager.add($('#cipher'), function(code, v) {
			if (code===NOTIFY.CREATE) {
				$('#gid').val(v);
			}
			$('#cipher').html('');
		}).then(function(cipher) {
			obj = cipher;
		});
	},
	ref : function() {
		var obj = null;
		CipherManager.ref($('#cipher'), {
			id : $('#gid').val(),
			ver : $('#ver').val(),
			draftno : $('#draft').val()
		}, function(code, v) {
			if ( code===NOTIFY.CANCEL) {
				$('#cipher').html('');
			} else if (code===NOTIFY.CREATE) {
				$('#gid').val(v.id);
				$('#ver').val(v.ver);
				$('#draft').val(v.draftno);
				_.edit();
			}
		}).then(function(cipher) {
			obj = cipher;
		});
	},
	edit : function() {
		var obj = null;
		CipherManager.edit($('#cipher'), {
			id : $('#gid').val(),
			ver : $('#ver').val(),
			draftno : $('#draft').val()
		}, function(code) {
			if ( code===NOTIFY.CANCEL) {
				$('#cipher').html('');
			}
		}).then(function(cipher) {
			obj = cipher;
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
	$('#add').click(function() {
		_.add();
	});
	$('#ref').click(function() {
		_.ref();
	});
	$('#edit').click(function() {
		_.edit();
	});
	$('#login').click(function() {
		_.login();
	});
	$('#creuser').click(function() {
		_.createUser();
	});
});
