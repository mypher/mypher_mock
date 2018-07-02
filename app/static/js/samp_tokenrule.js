_ = {
	prepare : function() {
		$('#add').click(function() {
			var rule1 = TokenRuleManager.add($('#rule1'), $('#groupid').val());
		});
		$('#ref').click(function() {
			var rule1 = TokenRuleManager.ref($('#rule1'), $('#groupid').val(), $('#tokenid').val());
		});
	}
};

$(function(){
	var groupid = '1234567890123456789012345678901234567890123456789012345678901234';
	$('#groupid').val(groupid);
	_.prepare();
});

