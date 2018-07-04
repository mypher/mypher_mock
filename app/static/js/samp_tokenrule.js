_ = {
	prepare : function() {
		$('#add').click(function() {
			var rule1 = TokenRuleManager.add($('#rule1'), $('#groupid').val(), $('#ver').val(), $('#draft').val());
		});
		$('#ref').click(function() {
			var rule1 = TokenRuleManager.ref($('#rule1'), $('#groupid').val(), $('#ver').val(), $('#draft').val(), $('#tokenid').val());
		});
	}
};

$(function(){
	_.prepare();
});

