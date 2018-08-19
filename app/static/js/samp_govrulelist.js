// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

_ = {
	prepare : function() {
		var groupid = '1234567890123456789012345678901234567890123456789012345678901234';
		var list = new GovRuleList($('#list'), groupid, function(val) {
			alert(val);
			list.close();
		});
	}
};

$(function() {
	_.prepare();
});
