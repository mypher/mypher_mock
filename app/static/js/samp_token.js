_ = {
	prepare : function() {
		var data = {
			groupid : '1234567890123456789012345678901234567890123456789012345678901234'
		};
		var token = new Token($('#token1'), data);
	}
};

$(function(){
	_.prepare();
});