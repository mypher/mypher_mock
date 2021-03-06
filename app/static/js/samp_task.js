// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

_ = {
	prepare : function() {
		$('#add').click(function() {
			var task = TaskManager.add(
				$('#task1'), 
				{
					id : $('#groupid').val(), 
					ver : $('#ver').val(), 
					draftno : $('#draft').val() 
				},
				function(code) {
					$('#task1').empty();
				}
			);
		});
		$('#ref').click(function() {
			var task = TaskManager.ref(
				$('#task1'), 
				{
					id : $('#groupid').val(), 
					ver : $('#ver').val(), 
					draftno : $('#draft').val()
				}
				, $('#id').val(),
				function(code) {
					$('#task1').empty();
				}
			);
		});
		$('#edit').click(function() {
			var task = TaskManager.edit(
				$('#task1'), 
				{
					id : $('#groupid').val(), 
					ver : $('#ver').val(), 
					draftno : $('#draft').val()
				}, $('#id').val(),
				function(code) {
					$('#task1').empty();
				}
			);
		});
		$('#login').click(function() {
			_.login();
		});
		$('#creuser').click(function() {
			_.createUser();
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

$(function(){
	_.prepare();
});
