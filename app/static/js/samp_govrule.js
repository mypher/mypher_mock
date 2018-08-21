// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

_ = {
	prepare : function() {
		$('#add').click(_.add);
		$('#ref').click(_.ref);
		$('#edit').click(_.edit);
	},

	add : function() {
		var rule = new GovRule({
			key : _.getParam(),
			mode : MODE.NEW
		}, function(){});
		History.run('test', rule); 
	},

	ref : function() {
		var rule = new GovRule({
			key : _.getParam(),
			mode : MODE.REF
		}, function(){});
		History.run('test', rule); 
	},

	edit : function() {
		var rule = new GovRule({
			key : _.getParam(),
			mode : MODE.EDIT
		},function(){});
		History.run('test', rule); 
	},

	getParam : function() {
		return {
			groupid : $('#groupid').val(), 
			ver : $('#ver').val(), 
			draftno : $('#draft').val(), 
			id : $('#ruleid').val()
		};
	},
	setDefault : function() {
		$('#groupid').val('7f861c4bc4b853bef4f14f0fe7bc336075175fbc61f977b7fd7df369964bc8bf');
		$('#ver').val('2');
		$('#draft').val('3');
		$('#ruleid').val('fc765414b5ab44862c43626b6041c3d71dcfdb3bb647b6beda9d9b8b0345d0d0');
	}
};

$(function(){
	UI.setMainDiv($('#rule1'));
	History.init($('#bc'));
	_.setDefault();
	_.prepare();
	var div = UI.popup(400,300);
	UserManager.login(div, function() {
		UI.closePopup();
	});
});
