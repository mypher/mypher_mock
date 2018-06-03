'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.talk');
let util = require('../cmn/util');
let sha256 = require('sha256');

module.exports = {
	/*
	 * getGroup 
	 * param : key - key of group
	 *		 ptn - 'oldest', 'latest'
	 *		 tm - time
	 *		 num - number of lists
	 */
	getGroup : async (key, ptn, tm, num) => {
		let data = {};
		try {
			let where = '';
			let prms = [key];
			//data = await db.any('select refer, current from talk_relation where groupkey=$1', [key]);
			let order = (ptn==='latest') ? ' order by det.tm desc' : ' order by det.tm asc';
			let limit = (num) ? ' limit ' + num : '';
			if (tm) {
				where = ' and det.tm>$2';
				prms.push(tm);
			}
			let sql = 'from (talk_relation rel ' + 
					'left join (' +
					'select row_number() over (partition by key order by ver asc) as rank,' +
					'key, tm from talk_detail ' +
					') det on det.rank=1 and rel.current=det.key) ' +
					'where rel.groupkey=$1' + where + order + limit;
			data.rel = await db.any('select rel.refer, rel.current, det.tm ' + sql, prms);
			let sql2 = 'select key, personid, tm, data from ' +
					 '(select row_number() over (partition by key order by ver desc) as rank,' +
					 'key, personid, tm, data from talk_detail) tm ' + 
					 'where tm.rank = 1 and tm.key in (select rel.current ' + sql + ')'; 
			data.dtl = await db.any(sql2, prms);
		} catch (e) {
			log.error('errored in getGroup : ' + e);
			throw 'system error';
		}
		return data;
	},
	/*
	 * post 
	 * param : key - key of group
	 *		 grp - group
	 *		 ref - reference key
	 *		 person - personid
	 *		 data - value
	 */
	post : async (grp, ref, person, data) => {
		try {
			let sql = 'insert into talk_detail(key, ver, personid, tm, data) values($1, $2, $3, $4, $5)';
			let tm = cmn.d2st(cmn.stdtm());
			let key = sha256(person + tm + data);
			await db.none(sql, [key, 1, person, tm, data]);
			log.debug(result);
			sql = 'insert into talk_relation(groupkey, refer, current) values($1, $2, $3)';
			await db.none(sql, [grp, ref, key]);
		} catch (e) {
			log.error('errored in getGroup : ' + e);
			throw 'system error';
		}
		return data;
	}
};
