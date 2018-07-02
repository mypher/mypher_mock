'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.rule');
let sha256 = require('sha256');

let dcipher = require('../db/cipher');
let drule = require('../db/rule');

module.exports = {
	/*
	 * _add
	 * params : d.groupid, d.ver, d.draftno, d.name, d.req, d.auth, sender
	 */
	_add  : async (sender, d) => {
		try {
			let response = null;
			await db.tx(async t=>{
				response = await cmn.isEditable({
					id : d.groupid,
					ver : d.ver,
					draftno : d.draftno,
					sender : sender
				}, t);
				if (response!==true) {
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
	 * update
	 * param : grp - group id
	 *         id - rule id
	 *         name - name
	 *         req - required number of approvals
	 *         auth - list of authorizers
	 */
	update  : async (grp, id, name, req, auth) => {
		return id;
	}
};
