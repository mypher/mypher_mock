// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

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
