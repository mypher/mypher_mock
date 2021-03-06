// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

// this module is used by both server and client.

module.exports = {
	/*
	 * isEmpty
	 * params : v
	 */
	isEmpty : function(v) {
		return (v===undefined||v===null||v==='');
	},

	/*
	 * isFulfill
	 * params : req, approved, members
	 */
	isFulfill : function(req, approved, members) {
		try {
			approved = Validator.cmn.pickMembers(approved, members);
			return (req<=approved.length);
		} catch (e) {
			return false;
		}
	},

	/*
	 * pickMembers 
	 * params : list, members
	 */
	pickMembers : function(list, members) {
		var ret = [];
		var o = {};
		list = (typeof(list)==='string') ? [list] : list;
		members = (typeof(members)==='string') ? [members] : members;
		for (var i in members) {
			o[members[i]] = true;
		}
		for (var i in list) {
			if (o[list[i]]) {
				ret.push(list[i]);
			}
		}
		return ret;
	},

	/*
	 * isMember
	 * params : person, list
	 */
	isMember : function(person, list) {
		if (Validator.cmn.isEmpty(list)) return false;
		if (Validator.cmn.isEmpty(person)) return false;
		list = list.split(',');
		for (var i in list) {
			if (person===list[i]) {
				return true;
			}
		}
		return false;
	},

	/*
	 * split
	 * params : csv
	 */
	split : function(csv) {
		return (csv===null||csv==='') ? [] : csv.split(',');
	}
};

var Validator = Validator||{};
Validator.cmn = module.exports;
