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
				'insert into task(groupid, ver, draftno, id, name, parentid, description, ruleid, rewardid, rquantity, tm) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
				[d.groupid, d.ver, d.draftno, d.id, d.name, d.parentid, d.description, d.ruleid, d.rewardid, d.quantity, d.tm]
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
				'select t.groupid, t.ver, t.draftno, t.parentid, pa.name parentname, t.id, t.name, t.description, t.ruleid, r.name rname, r.req, r.auth, ' +
				't.rewardid, t.rquantity, ts.pic, p.name pname, ts.pic_approve, ts.review ' +
				'from ((((task t '+
				'inner join task_state ts on t.groupid = ts.groupid and t.ver = ts.ver and t.draftno = ts.draftno and t.id = ts.id ) ' +
				'left join task pa on t.groupid = pa.groupid and t.ver = pa.ver and t.draftno = pa.draftno and t.parentid = pa.id ) ' +
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
	},

	/*
	 * approvePic
	 * params : d.id, d.ver, d.draftno, d.id, d.pic_approve, tx
	 */
	approvePic : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let cnt = await tx.result(
				'update task_state set pic_approve=$1 where groupid=$2 and ver=$3 and draftno=$4 and id=$5',
				[d.pic_approve, d.groupid, d.ver, d.draftno, d.id], 
				r=>r.rowCount
			);
			// check number of affected rows
			if (1!==cnt) {
				throw 'number of updated rows was not 1';
			}
		} catch (e) {
			log.error('errored in copy : ' + e);
			throw e;
		}
	},

	/*
	 * approveReview
	 * params : d.id, d.ver, d.draftno, d.id, d.review, tx
	 */
	approveReview : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let cnt = await tx.result(
				'update task_state set review=$1 where groupid=$2 and ver=$3 and draftno=$4 and id=$5',
				[d.review, d.groupid, d.ver, d.draftno, d.id], 
				r=>r.rowCount
			);
			// check number of affected rows
			if (1!==cnt) {
				throw 'number of updated rows was not 1';
			}
		} catch (e) {
			log.error('errored in copy : ' + e);
			throw e;
		}
	},

	/*
	 * update
	 * params : d.groupid, d.ver, d.draftno, d.id, d.parentid, d.name, d.description, 
	 *          d.ruleid, d.rewardid, d.quantiry, d.pic, d.pic_approve, d.review, tx
	 */
	update : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let cnt = await tx.result(
				'update task ' +
				'set parentid=$1, name=$2, description=$3, ruleid=$4, rewardid=$5, rquantity=$6 ' +
				'where groupid=$7 and ver=$8 and draftno=$9 and id=$10 ',
				[d.parentid, d.name, d.description, d.ruleid, d.rewardid, d.qruantity, d.groupid, d.ver, d.draftno, d.id], 
				r=>r.rowCount
			);
			// check number of affected rows
			if (1!==cnt) {
				throw 'number of updated rows was not 1';
			}
			cnt = await tx.result(
				'update task_state ' +
				'set pic=$1, pic_approve=$2, review=$3 ' +
				'where groupid=$4 and ver=$5 and draftno=$6 and id=$7 ',
				[d.pic, d.pic_approve, d.review, d.groupid, d.ver, d.draftno, d.id], 
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
	},

	/*
	 * applyPic
	 * params : d.pic, d.groupid, d.ver, d.draftno, d.id, tx
	 */
	applyPic : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			cnt = await tx.result(
				'update task_state ' +
				"set pic=$1, pic_approve='', review='' " +
				'where groupid=$2 and ver=$3 and draftno=$4 and id=$5 ',
				[d.pic, d.groupid, d.ver, d.draftno, d.id], 
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
	},

	/*
	 * approvePic
	 * params : d.pic_approve, d.groupid, d.ver, d.draftno, d.id, tx
	 */
	approvePic : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			cnt = await tx.result(
				'update task_state ' +
				'set pic_approve=$1 ' +
				'where groupid=$2 and ver=$3 and draftno=$4 and id=$5 ',
				[d.pic_approve, d.groupid, d.ver, d.draftno, d.id], 
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
	},

	/*
	 * approveReview
	 * params : d.review, d.groupid, d.ver, d.draftno, d.id, tx
	 */
	approveReview : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			cnt = await tx.result(
				'update task_state ' +
				'set review=$1 ' +
				'where groupid=$2 and ver=$3 and draftno=$4 and id=$5 ',
				[d.review, d.groupid, d.ver, d.draftno, d.id], 
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
	},
};
