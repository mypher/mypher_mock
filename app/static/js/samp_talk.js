_ = {
	regPeer : function() {
		var talk = new Talk($('#talk1'), 'T901567890123456789012345678901234567890123456789012345678901234');
	}
};

$(function(){
	$('#regpeer').click(()=>{_.regPeer()});
});

