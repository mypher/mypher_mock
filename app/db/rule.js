// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

'use_strict'

let db = require('./db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('db.rule');

module.exports = {

	/*
	 * insert
	 * params : d.groupid, d.ver, d.draftno, d.id, d.name, d.req, d.auth, d.tm, tx
	 */
	insert  : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			await tx.none(
				'insert into rule(groupid, ver, draftno, id, name, req, auth, tm) values($1, $2, $3, $4, $5, $6, $7, $8)', 
				[d.groupid, d.ver, d.draftno, d.id , d.name, d.req, d.auth, d.tm]
			);
		} catch (e) {
			log.error('errored in get : ' + e);
			throw e;
		}
	}, 

	/*
	 * get
	 * params : d.groupid, d.ver, d.draftno, d.id
	 */
	get : async (d, tx)=> {
		try {
			tx = tx ? tx : db;
			return await tx.one(
				'select groupid, ver, draftno, id, name, req, auth from rule where groupid = $1 and ver = $2 and draftno = $3 and id = $4', 
				[d.groupid, d.ver, d.draftno, d.id]
			);
		} catch (e) {
			log.error('errored in get : ' + e);
			throw e;
		}
	},

	/*
	 * list
	 * params : d.groupid, d.ver, d.draftno
	 */
	list : async d => {
		try {
			return await db.any(
				'select groupid, ver, draftno, id, name, req, auth from rule where groupid = $1 and ver = $2 and draftno = $3', 
				[d.groupid, d.ver, d.draftno]
			);
		} catch (e) {
			log.error('errored in get : ' + e);
			throw e;
		}
	},

	/*
	 * list_fast 
	 * params : d.groupid, d.ver, d.draftno, d.name
	 */
	list_fast : async d => {
		try {
			let name = cmn.sanitizeForLike(d.name);
			return await db.any(
				'select id, name from rule '+
				'where groupid = $1 and ver = $2 and draftno = $3 and name like $4 limit 300'
				, [d.groupid, d.ver, d.draftno, '%' + name + '%']
			);
		} catch (e) {
			log.error('errored in load : ' + e);
			throw e;
		}
	},

	/*
	 * copy 
	 * params : src.id, src.ver, src.draftno, to.id, to.ver, to.draftno, to.tm, tx
	 */
	copy : async (src, to, tx) => {
		try {
			tx = tx ? tx : db;
			await tx.none(
				'insert into rule(groupid, ver, draftno, id, name, req, auth, tm) ' +
				'select groupid, $1, $2, id, name, req, auth, $3 from rule ' +
				'where groupid = $4 and ver = $5 and draftno = $6'
				,[to.ver, to.draftno, to.tm, src.id, src.ver, src.draftno]
			);
		} catch (e) {
			log.error('errored in copy : ' + e);
			throw e;
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
	update  : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let cnt = await tx.result(
				'update rule ' +
				'set name=$1, req=$2, auth=$3 ' +
				'where groupid=$4 and ver=$5 and draftno=$6 and id=$7 ',
				[d.name, d.req, d.auth, d.groupid, d.ver, d.draftno, d.id],
				r=>r.rowCount
			);
			// check number of affected rows
			if (1!==cnt) {
				throw 'number of updated rows was not 1';
			}
		} catch (e) {
			log.error('errored in update : ' + e);
			throw e;
		}
	}
};
