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
		$('#groupid').val('7f861c4bc4b853bef4f14f0fe7bc336075175fbc61f977b7fd7df369964bc8bf');
		$('#ver').val('2');
		$('#draft').val('3');
		$('#tokenid').val('e17d4201da0dfe4e890982b33c09e33fafedcfe17b1b72c932d008450a67cc28');
	}
};

$(function(){
	UI.setMainDiv($('#rule1'));
	History.init($('#bc'));
	_.setDefault();
	_.prepare();
});

