_ = {
	prepare : function() {
		var person = new SelPerson($('#sel_person'), function(ok, sel) {
			alert(ok);
		}, ['test2', 'test3']);
	}
};

$(function(){
	_.prepare();
});