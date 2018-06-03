'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.rule');
let util = require('../cmn/util');
let sha256 = require('sha256');

module.exports = {

	/*
	 * get
	 * param : grp - group id
	 *         id - rule id
	 */
	get : async (grp, id)=> {
		let data = {};
		try {
			data =  await db.one(
				'select groupid, id, name, req, auth from rule where groupid = $1 and id = $2', 
				[grp, id]
			);
			if (data.code) {
				if (data.code===db.NODATA) {
					return {};
				} 
				throw 'data duplicate ' + grp + ',' + id;
			}
			return data;
		} catch (e) {
			log.error('errored in get : ' + e);
			throw 'system error';
		}
		return {};
	},

	/*
	 * add
	 * param : grp - group id
	 *         name - name
	 *         req - required number of approvals
	 *         auth - list of authorizers
	 */
	add  : async (grp, name, req, auth) => {
		try {
			if (!cmn.chkTypes([
				{ p:grp, f:cmn.isKey},
				{ p:name, f:cmn.isEmpty, r:true},
				{ p:req, f:cmn.isSmallInt}
			])) {
				throw 'invalid parameter';
			}
			let tm = cmn.d2st(cmn.stdtm());
			let id = sha256('rule' + grp + name + tm);
			await db.none(
				'insert into rule(groupid, id, name, req, auth, tm) values($1, $2, $3, $4, $5, $6)', 
				[grp, id , name, req, auth, tm]
			);
			return id;
		} catch (e) {
			log.error('errored in get : ' + e);
			throw 'system error';
		}
		return '';

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
	/*	try {
			let tm = cmn.d2st(cmn.stdtm());
			await db.none(
				'update rule set req = $1, auth = $2, tm = $3 where groupid = $4 and id = $5', 
				[req, auth ,tm, auth, tm]
			);
			if (data.code) {
				if (data.code===db.NODATA) {
					return {};
				} 
				throw 'data duplicate ' + grp + ',' + id;
			}
			return data;
		} catch (e) {
			log.error('errored in get : ' + e);
			throw 'system error';
		}
		return {};*/

	}
};
