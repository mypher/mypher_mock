// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.rule');
let sha256 = require('sha256');

let drule = require('../db/rule');
let dperson = require('../db/person');

let vrule = require('../validator/rule');

module.exports = {
	/*
	 * _add
	 * params : d.groupid, d.ver, d.draftno, d.name, d.req, d.auth, sender
	 */
	_add  : async (sender, d) => {
		try {
			let response = null;
			await db.tx(async t=>{
				response = await cmn.isCipherEditable(sender, {
					id : d.groupid, 
					ver : d.ver, 
					draftno : d.draftno});
				if (response.code) {
					return;
				}
				response = vrule.validateRule(d);
				if (response.code) {
					return;
				}
				if (!cmn.chkTypes([
					{ p:d.groupid, f:cmn.isKey},
					{ p:d.ver, f:cmn.isSmallInt},
					{ p:d.draftno, f:cmn.isSmallInt},
					{ p:d.name, f:cmn.isEmpty, r:true},
					{ p:d.req, f:cmn.isSmallInt}
				])) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				let v = await cmn.chkMember(d.auth, t);
				if (!v) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				d.tm = cmn.d2st(cmn.stdtm());
				d.id = sha256('rule' + d.groupid + d.name + d.tm);
				await drule.insert(d, t);
				response = d.id;
			});
			return response;
		} catch (e) {
			log.error('errored in _add : ' + e);
			throw 'system error';
		}
	}, 

	/*
	 * get
	 * params : d.groupid, d.ver, d.draftno, d.id
	 */
	get : async d=> {
		let data = {};
		try {
			return await drule.get(d);
		} catch (e) {
			log.error('errored in get : ' + e);
		}
		return {code:'NOT_FOUND'};
	},

	/*
	 * list
	 * params : d.groupid, d.ver, d.draftno
	 */
	list : async d => {
		try {
			return await drule.list(d);
		} catch (e) {
			log.error('errored in get : ' + e);
			throw 'system error';
		}
	},

	/*
	 * list_fast 
	 * params : d.groupid, d.ver, d.draftno, d.name
	 */
	list_fast : async d => {
		try {
			return await drule.list_fast(d);
		} catch (e) {
			log.error('errored in load : ' + e);
			throw 'system error';
		}
	},



	/*
	 * _commit
	 * param : sender, ini, cur
	 */
	_commit  : async (sender, ini, cur) => {
		let validate = async function(tx) {
			let d = await drule.get(ini, tx);
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
				response = await cmn.isCipherEditable(sender, {
					id : ini.groupid, 
					ver : ini.ver, 
					draftno : ini.draftno});
				if (response.code) {
					return;
				}
				response = vrule.validateRule(cur);
				if (response.code) {
					return;
				}
				if (!cmn.chkTypes([
					{ p:cur.groupid, f:cmn.isKey},
					{ p:cur.ver, f:cmn.isSmallInt},
					{ p:cur.draftno, f:cmn.isSmallInt},
					{ p:cur.name, f:cmn.isEmpty, r:true},
					{ p:cur.req, f:cmn.isSmallInt}
				])) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				let v = await cmn.chkMember(cur.auth, t);
				if (!v) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				await drule.update(cur, t);	
			}).then(function() {
			}).catch(function() {
				response = {code:'INVALID_PARAM'};
			});
			return response;
		} catch (e) {
			log.error('errored in _commit : ' + e);
			throw 'system error';
		}
	}
};
