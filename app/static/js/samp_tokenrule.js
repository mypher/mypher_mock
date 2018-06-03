_ = {
	prepare : function() {
		_.rule1 = new TokenRule($('#rule1'), 1);
		_.rule2 = new TokenRule($('#rule2'), 2);
	}
};

$(function(){
	_.prepare();
});

$('#test1').click(function() {
	alert(JSON.stringify(_.rule1.get()));
});

$('#test2').click(function() {
	alert(JSON.stringify(_.rule2.get()));
});

$('#test3').click(function() {
	_.rule1.set({
		type : '1',
		trigger : '2',
		trigger_val1 : '値１',
		trigger_val2 : '<"',
		content_target : '2',
		content_send_type : '0',
		content_quantity : '&nbsp;'
	});
});