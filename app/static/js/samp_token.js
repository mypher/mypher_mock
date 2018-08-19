// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

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
