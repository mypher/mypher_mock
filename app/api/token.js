// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.token');
let sha256 = require('sha256');
let dcipher = require('../db/cipher');
let dtoken = require('../db/token');
let vtoken = require('../validator/token');
let vcipher = require('../validator/cipher');

module.exports = {
	/*
	 * add 
	 * param : name - filtering cond
	 */
	_add : async (sender, d)=> {
		try {
			let response = null;
			await db.tx(async t=>{
				response = cmn.isCipherEditable(sender, {
					id : d.groupid, 
					ver : d.ver, 
					draftno : d.draftno});
				if (response.code) {
					return;
				}
				if (!cmn.chkTypes([
					{p:d.groupid, f:cmn.isKey},
					{p:d.name, f:cmn.isEmpty, r:true},
					{p:d.type, f:cmn.isSmallInt}
				])) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				d = cmn.toInt(d, ['type', 'firetype', 'noftoken', 'rewardtype', 'rcalctype', 'rquantity']);
				let tm = cmn.d2st(cmn.stdtm());
				let id = sha256('token' + d.groupid + d.name + tm);
				d.id = id;
				d.tm = tm;
				await dtoken.insert(d, t);
				response = id;
				return;
			});
			return response;
		} catch (e) {
			log.error('errored in add : ' + e);
			throw 'system error';
		}
	},

	/**
	 * _commit
	 * params sender, ini, cur
	 */
	_commit : async (sender, ini, cur) => {
		let validate = async function(tx) {
			let d = await dtoken.load(ini, tx);
			return cmn.validate(d, ini);
		}
		try {
			let response = {};
			await db.tx(async t=>{
				// check keys
				if (!cmn.compare(ini, cur, ['groupid', 'ver', 'draftno', 'id'])) {
					respnse = {code:'INVALID_PARAM'};
					return;
				}
				// check if data is changed while editing
				let ret = await validate(t);
				if (!ret) {
					response = {code:'ALREADY_CHANGED'};
					return;
				}
				response = cmn.isCipherEditable(sender, {
					id : d.groupid, 
					ver : d.ver, 
					draftno : d.draftno});
				if (response.code) {
					return;
				}
				if (!cmn.chkTypes([
					{p:cur.groupid, f:cmn.isKey},
					{p:cur.name, f:cmn.isEmpty, r:true},
					{p:cur.type, f:cmn.isSmallInt}
				])) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				cur = cmn.toInt(cur, ['type', 'firetype', 'noftoken', 'rewardtype', 'rcalctype', 'rquantity']);
				// update
				await dtoken.update(cur, t);
			}).then(function() {
			}).catch(function() {
				response = {code:'INVALID_PARAM'};
			});
			return response;
		} catch (e) {
			log.error('errored in _commit : ' + e);
			throw 'system error';
		}
	},

	/*
	 * load
	 * params : d.groupid, d.ver, d.draftno, d.id
	 */
	load : async d => {
		try {
			return await dtoken.load(d);
		} catch (e) {
			log.error('errored in load : ' + e);
		}
		return {code:'NOT_FOUND'};
	},

	/*
	 * list_fast
	 * params  : d.groupid, d.ver, d.draftno, d.name
	 */ 
	list_fast : async d => {
		try {
			return await dtoken.list_fast(d);
		} catch (e) {
			log.error('errored in load : ' + e);
			throw 'system error';
		}
	}

};
