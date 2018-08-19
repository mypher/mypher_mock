'use_strict'

let db = require('./db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('db.token');

module.exports = {
	/*
	 * insert 
	 * param : name - filtering cond
	 */
	insert : async (d, tx)=> {
		try {
			tx = tx ? tx : db;
			await tx.none(
				'insert into token(groupid, ver, draftno, id, name, type, firetype, taskid, tokenid, noftoken, rewardtype, rcalctype, rquantity, tm) ' +
				'values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
				[d.groupid, d.ver, d.draftno, d.id, d.name, d.type, d.firetype, d.taskid, d.tokenid, d.noftoken, d.rewardtype, d.rcalctype, d.rquantity, d.tm]
			);
		} catch (e) {
			log.error('errored in insert : ' + e);
			throw e
		}
	},

	/*
	 * load
	 * params : d.groupid, d.ver, d.draftno, d.id, tx
	 */
	load : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			return await tx.one(
				'select t.groupid, t.ver, t.draftno, t.id, t.name, t.type, t.firetype, t.taskid, tk.name taskname, ' +
				't.tokenid, tn.name tokenname, t.noftoken, t.rewardtype, t.rquantity, t.rcalctype, t.tm ' +
				'from ((token t '+
				'left join task tk on t.groupid = tk.groupid and t.ver = tk.ver and t.draftno = tk.draftno and t.taskid = tk.id ) ' +
				'left join token tn on t.groupid = tn.groupid and t.ver = tn.ver and t.draftno = tn.draftno and t.tokenid = tn.id ) ' +
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
	 * params  : d.groupid, d.ver, d.draftno, d.name, tx
	 */ 
	list_fast : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let name = cmn.sanitizeForLike(d.name);
			return await tx.any(
				'select id, name from token '+
				'where groupid = $1 and ver = $2 and draftno = $3 and name like $4 limit 300'
				, [d.groupid, d.ver, d.draftno,  '%' + name + '%']
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
				
				'insert into token(groupid, ver, draftno, id, name, type, firetype, taskid, tokenid, noftoken, rewardtype, rcalctype, rquantity, tm) ' +
				'select groupid, $1, $2, id, name, type, firetype, taskid, tokenid, noftoken, rewardtype, rcalctype, rquantity, $3 from token ' +
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
	 * params :  src.id, src.ver, src.draftno, to.id, to.ver, to.draftno, to.tm, tx
	 */
	update : async (d, tx) => {
		try {
			tx = tx ? tx : db;
			let cnt = await tx.result(
				'update token ' +
				'set name=$1, type=$2, firetype=$3, taskid=$4, tokenid=$5, noftoken=$6, rewardtype=$7, rcalctype=$8, rquantity=$9 ' +
				'where groupid=$10 and ver=$11 and draftno=$12 and id=$13 ',
				[d.name, d.type, d.firetype, d.taskid, d.tokenid, d.noftoken, d.rewardtype, d.rcalctype, d.rquantity, d.groupid, d.ver, d.draftno, d.id],
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
