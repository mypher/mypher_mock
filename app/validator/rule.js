// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

// this module is referred by both server and client.

module.exports = {
	validateRule : function(d) {
		try {
			var auth = d.auth.split(',');
			var req = parseInt(d.req);
			if (auth.length<req) {
				return {code :'REQ_BIGGER_THAN_AUTH'};
			}
			if (auth.length===0) {
				return {code :'AUTH_NOT_SET'};
			}
			return {};
		} catch (e) {
			return {code :'INVALID_PARAM'};
		}
	}
};

var Validator = Validator||{};
Validator.rule = module.exports;
if (typeof(require)!=='undefined') {
	Validator.cmn = require('./cmn');
	Validator.cipher = require('./cipher');
}