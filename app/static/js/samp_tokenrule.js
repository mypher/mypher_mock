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
		var rule = new TokenRule({
			key : _.getParam(),
			mode : MODE.NEW
		}, function(){});
		History.run('test', rule); 
	},

	ref : function() {
		var rule = new TokenRule({
			key : _.getParam(),
			mode : MODE.REF
		}, function(){});
		History.run('test', rule); 
	},

	edit : function() {
		var rule = new TokenRule({
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
			id : $('#tokenid').val()
		};
	},
	setDefault : function() {
		$('#groupid').val('50e9ff3a7c7719e735f4ffc45298806ebacf4f351cc66913d262f7ac6dce82e0');
		$('#ver').val('2');
		$('#draft').val('1');
		$('#tokenid').val('31554009c3bdc1e9f8666b62b220033650a3e5161cc457a7a954fb7f5a159f92');
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

