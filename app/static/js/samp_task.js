_ = {
	prepare : function() {
		$('#add').click(function() {
			var task = TaskManager.add($('#task1'), $('#groupid').val(), $('#ver').val(), $('#draft').val());
		});
		$('#ref').click(function() {
			var task = TaskManager.ref($('#task1'), $('#groupid').val(), $('#ver').val(), $('#draft').val(), $('#id').val());
		});
	}
};

$(function(){
	_.prepare();
});
