// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

'use_strict'

let dperson = require('../db/person');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.person');

module.exports = {
	/*
	 * list_fast 
	 * param : name - filtering cond
	 */
	list_fast : async name=> {
		try {
			return await dperson.list_fast(name);
		} catch (e) {
			log.error('errored in list_fast : ' + e);
			throw 'system error';
		}
	},

	/*
	 * name
	 * param : ids - list of IDs
	 */
	name : async ids => {
		try {
			return await dperson.name(ids);
		} catch (e) {
			log.error('errored in name : ' + e);
			throw 'system error';
		}
	},

	/*
	 * register
	 */
	register : async d => {
		try {
			if (!cmn.chkTypes([
				{p:d.name, f:cmn.isEmpty, r:true},
				{p:d.id, f:cmn.isAlphaNumeric},
				{p:d.key, f:cmn.isEmpty, r:true}
			])) {
				return {code:'INVALID_PARAM'};
			}
			if (!cmn.chkStrLen(d.id, 6, 16) || 
				!cmn.chkStrLen(d.name, 0, 32)) {
				return {code:'INVALID_PARAM'};
			}

			let ret = await dperson.isexist(d.id);
			if (ret) {
				return {code:'ALREADY_REGISTERED'};
			}
			
			let tm = cmn.d2st(cmn.stdtm());
			await dperson.register(d.id, d.name, d.key, d.profile, tm);
			return true;
		} catch (e) {
			log.error('errored in name : ' + e);
			throw 'system error';
		}
	},

	/*
	 * login
	 */
	login : async d => {
		if (await dperson.validate({
			id : d.id,
			tm : d.tm,
			hash : d.hash,
			islogin : true
		})) {
			return true;
		}
		return false;
	}

};
