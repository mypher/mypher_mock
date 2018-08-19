// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

_ = {
	regPeer : function() {
		var talk = new Talk($('#talk1'), 'T901567890123456789012345678901234567890123456789012345678901234');
	}
};

$(function(){
	$('#regpeer').click(()=>{_.regPeer()});
});

