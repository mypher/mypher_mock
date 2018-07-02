'use_strict'

let db = require('./db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.task');

module.exports = {
	/*
	 * insert 
	 * params : d.groupid, d.ver, d.draftno, d.id, d.name, d.ruleid, d.rewardid
	 *          d.quantity, d.tm, tx
	 */
	insert : async (d, tx)=> {
		try {
			tx = tx ? tx : db;
			await tx.none(
				'insert into task(groupid, ver, draftno, id, name, description, ruleid, rewardid, rquantity, tm) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
				[d.groupid, d.ver, d.draftno, d.id, d.name, d.desc, d.ruleid, d.rewardid, d.rquantity, d.tm]
			);
			await tx.none(
				'insert into task_state(groupid, ver, draftno, id, pic, tm) values($1, $2, $3, $4, $5, $6)',
				[d.groupid, d.ver, d.draftno, d.id, d.pic, d.tm]
			);
		} catch (e) {
			log.error('errored in insert : ' + e);
			throw e;
		}
	},

	/*
	 * load
	 * params : d.groupid, d.ver, d.draftno, d.id
	 */
	load : async d => {
		try {
			return await db.one(
				'select t.groupid, t.parentid, t.id, t.name, t.description, t.ruleid, r.name rname, r.req, r.auth, ' +
				't.rewardid, t.rquantity, ts.pic, p.name pname, ts.pic_approve, ts.review ' +
				'from (((task t '+
				'inner join task_state ts on t.groupid = ts.groupid and t.ver = ts.ver and t.draftno = ts.draftno and t.id = ts.id ) ' +
				'left join rule r on t.groupid = r.groupid and t.ver = r.ver and t.draftno = r.draftno and t.ruleid = r.id ) ' +
				'left join person p on ts.pic = p.id ) ' +
				'where t.groupid = $1 and t.ver = $2 and t.draftno = $3 and t.id = $4'
				, [d.groupid, d.ver, d.draftno, d.id]
			);
		} catch (e) {
			log.error('errored in load : ' + e);
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
				'select id, name from task '+
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
				'insert into task(groupid, ver, draftno, parentid, id, name, description, ruleid, rewardid, rquantity, tm) ' +
				'select groupid, $1, $2, parentid, id, name, description, ruleid, rewardid, rquantity, $3 from task ' +
				'where groupid = $4 and ver = $5 and draftno = $6'
				,[to.ver, to.draftno, to.tm, src.id, src.ver, src.draftno]
			);
			await tx.none(
				'insert into task_state(groupid, ver, draftno, id, pic, pic_approve, review, tm) ' +
				'select groupid, $1, $2, id, pic, pic_approve, review, $3 from task_state ' +
				'where groupid = $4 and ver = $5 and draftno = $6'
				,[to.ver, to.draftno, to.tm, src.id, src.ver, src.draftno]
			);
		} catch (e) {
			log.error('errored in copy : ' + e);
			throw e;
		}
	}

};
