'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.person');
let util = require('../cmn/util');
let sha256 = require('sha256');

module.exports = {
	/*
	 * list_fast 
	 * param : name - filtering cond
	 */
	list_fast : async name=> {
		try {
			return await db.any(
				'select id, name from person where id like $1 or name like $1 limit 300', 
				['%' + name + '%']
			);
		} catch (e) {
			log.error('errored in getGroup : ' + e);
			throw 'system error';
		}
		return [];
	},

	/*
	 * name
	 * param : ids - list of IDs
	 */
	name : async ids => {
		try {
			log.info(ids);
			return await db.any(
				'select id, name from person where id in ($1:csv)', [ids]
			);
		} catch (e) {
			log.error('errored in name : ' + e);
			throw 'system error';
		}
		return [];
	}


};
