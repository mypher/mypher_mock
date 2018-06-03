_ = {
	prepare : function(data) {
		GovRuleMgr.make($('#govrule1'), data, true).then(function(gov) {
			_.govrule = gov;
		});
	}
};

$(function(){
	var data = {};
	$('#group').blur(function() {
		data.groupid = $(this).val(); 
		_.prepare(data);
	}).val('1234567890123456789012345678901234567890123456789012345678901234');
	$('#ok').click(function() {
		GovRuleMgr.commit(_.govrule).then(function(id) {
			data.id = id;
			_.prepare(data);
		})
	});
	$('#cancel').click(function() {
		_.prepare(data);
	});
});