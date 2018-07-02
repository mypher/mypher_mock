_ = {
	prepare : function() {
		var groupid = '1234567890123456789012345678901234567890123456789012345678901234';
		$('#gid').val(groupid);
		$('#add').click(function() {
			var task1 = new Task();
			task1.init({
				div : $('#task1'), 
				data : {
					groupid : $('#gid').val()
				},
				mode : MODE.NEW,
				cb : function(p) {
					UI.alert(p);
				}
			});
		});
		$('#ref').click(function() {
			var task1 = new Task();
			task1.init({
				div : $('#task1'),
				data : {
					groupid : $('#gid').val(),
					id : $('#id').val()
				},
				mode : MODE.REF,
				cb : function(p) {
					UI.alert(p);
				}
			});
		});
	}
};

$(function(){
	_.prepare();
});
