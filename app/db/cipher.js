// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

'use_strict'

let db = require('./db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('db.cipher');


module.exports = {
	NOT_EXIST : -1,
	NOT_EDITABLE : -2,
	EDITABLE : 0,
	/*
	 * insert 
	 * param : name
	 *         purpose
	 *         drule
	 */
	insert : async (d, tx)=> {
		try {
			tx = tx ? tx : db;
			await tx.none(
					'insert into cipher(id, name, purpose, drule_req, drule_auth, ver, draftno, editor, tm) values ($1, $2, $3, $4, $5, 1, 1, $6, $7)'
					, [d.id, d.name, d.purpose, d.drule_req, d.drule_auth, d.editor, d.tm]
				);
		} catch (e) {
			log.error('errored in insert : ' + e);
			throw e;
		}
	},
	/*
	 * load
	 * params : d.id, d.ver, d.draftno
	 */
	load : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			return await tx.one(
				'select c.id, c.name, c.purpose, c.drule_req, c.drule_auth, c.approved, c.ver, c.draftno, c.editor, c.formal, ' +
				'f.ver formalver, f.draftno formaldraft ' +
				'from cipher c left join ' +
				'(select * from (select ver, draftno, id, formal, rank() over (partition by id order by formal desc, ver desc) rank1 ' +
				'from cipher as c1 where formal=true) as c2 where rank1=1) as f on c.id = f.id ' +
				'where c.id = $1 and c.ver = $2 and c.draftno = $3 '
				, [d.id, d.ver, d.draftno]
			);
		} catch (e) {
			throw e;
		}
	},

	/*
	 * getCurrent
	 * params : d.id, tx
	 */
	getCurrent : async(d, tx) => {
		try {
			tx = tx ? tx : db;
			return await tx.one(
				'select id, name, purpose, drule_req, drule_auth, approved, ver, draftno, editor, formal from cipher where id = $1 and formal = true order by ver desc limit 1'
				, [d.id]
			);
		} catch (e) {
			throw e;
		}
	
	},
	/*
	 * update
	 * params : d.name, d.purpose, d.drule_req, d.drule_auth, d.id, d.ver, d.draftno, tx
	 */
	update : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let cnt = await tx.result(
				'update cipher set name=$1,purpose=$2, drule_req=$3, drule_auth=$4 where id=$5 and ver = $6 and draftno = $7',
				[d.name, d.purpose, d.drule_req, d.drule_auth, d.id, d.ver, d.draftno], 
				r=>r.rowCount
			);
			// check number of affected rows
			if (1!==cnt) {
				throw 'updated row was not 1';
			}
		} catch (e) {
			log.error('errored in load : ' + e);
			throw e;
		}
	},
	/*
	 * approve
	 * params : d.id, d.ver, d.draftno, d.approved, d.formal, tx
	 */
	approve : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let cnt = await tx.result(
				'update cipher set approved=$1, formal=$2 where id=$3 and ver=$4 and draftno=$5',
				[d.approved, d.formal, d.id, d.ver, d.draftno], 
				r=>r.rowCount
			);
			// check number of affected rows
			if (1!==cnt) {
				throw 'number of updated rows was not 1';
			}
		} catch (e) {
			log.error('errored in approve : ' + e);
			throw e;
		}
	},
	/*
	 * getCurrentVer
	 * params : d.id, tx
	 */
	getCurrentVer : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let rec = await tx.one(
				'select max(ver) from cipher where id = $1 and formal = true'
				, [d.id]
			);
			return (rec.ver===null) ? 0 : rec.ver;
		} catch (e) {
			log.error('errored in isEditable : ' + e);
			throw e;
		}
	},
	/*
	 * getLatestFormalVersion
	 * params : d.id, tx
	 */
	getLatestFormalVersion : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let rec = await tx.any(
				'select * from cipher where id = $1 and ver = (select max(ver) from cipher where id = $1) and formal = true'
				, [d.id]
			);
			return (rec.length===0) ? null : rec[0];
		} catch (e) {
			log.error('errored in getLatestFormalVersion : ' + e);
			throw e;
		}
	},

	/*
	 * isExist
	 * params :  d.id, d.ver, d.draftno, tx
	 */
	isExist : async(d, tx) => {
		try {
			tx = tx ? tx : db;
			await tx.one(
				"select id from cipher where id = $1 and ver = $2 and draftno = $3"
				, [d.id, d.ver, d.draftno]
			);
			return true;
		} catch (e) {
			return false;
		}
	},	

	/*
	 * newDraft
	 * params : d.id, tx
	 */
	newDraft : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let rec = await tx.one(
				'select ver, draftno, formal from cipher where id=$1 order by ver desc, formal desc, draftno desc limit 1'
				, [d.id]
			);
			if (rec.formal) {
				return {id:d.id, ver:rec.ver+1, draftno:1};
			} else {
				return {id:d.id, ver:rec.ver, draftno:rec.draftno+1};
			}
		} catch (e) {
			return  {id:d.id, ver:1, draftno:1};
		}
	},

	/*
	 * copy 
	 * params : src.id, src.ver, src.draftno, to.id, to.ver, to.draftno, to.sender, to.tm, tx
	 */
	copy : async (src, to, tx) => {
		try {
			tx = tx ? tx : db;
			await tx.none(
				'insert into cipher(id, ver, draftno, name, purpose, drule_req, drule_auth, approved, editor, formal, tm) ' +
				"select id, $1, $2, name, purpose, drule_req, drule_auth, '', $3, false, $4 from cipher " +
				'where id = $5 and ver = $6 and draftno = $7'
				,[to.ver, to.draftno, to.sender, to.tm, src.id, src.ver, src.draftno]
			);
		} catch (e) {
			log.error('errored in copy : ' + e);
			throw e;
		}
	},

	/**
	 * listVersion
	 * params : d, tx
	 */
	listVersion : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			// get history
			return await tx.any(
				'select id, ver, draftno, editor, formal from cipher where id=$1 order by ver desc, formal desc, draftno asc',
				[d.id]
			);
		} catch(e) {
			log.error('error in listVersion : ' + e);
			throw e;
		}
	},

	/**
	 * listbywords
	 * params d, tx
	 */
	listbywords : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			d = cmn.sanitizeForLike(d);
			// get history
			return await tx.any(
				'select * from cipher_current where name like $1 or purpose like $1',
				['%' + d + '%']
			);
		} catch(e) {
			log.error('error in listbywords : ' + e);
			throw e;
		}
	}
};
