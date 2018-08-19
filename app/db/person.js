// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

'use_strict'

let db = require('./db');
let cmn = require('./cmn');
let sha256 = require('sha256');
let log = require('../cmn/logger')('db.person');

module.exports = {
	/*
	 * validate
	 * d.id : user id
	 * d.tm : time
	 * d.data : data to validate
	 * d.hash : hash to compare
	 * d.islogin : validate for login
	 */
	validate : async d => {
		try {
			let cur = (new Date().getTime());
			if (Math.abs(parseInt(d.tm)-cur) > 60000) {
				log.error('sent time is invalid');
				return false;
			}
			let rec = await db.one(
				'select key from person where id = $1', [d.id]
			);
			let phrase = d.id + rec.key + d.tm;
			if (d.islogin) {
				d.data = phrase;
			}
			let v = sha256(d.data + phrase);
			v = sha256(v + phrase);
			if (v!==d.hash) {
				return false;
			}
			return true;
		} catch (e) {
			log.info('errored in validate : ' + e);
			return false;
		}
	},

	/*
	 * list_fast 
	 * param : name - filtering cond
	 */
	list_fast : async name=> {
		try {
			name = cmn.sanitizeForLike(name);
			return await db.any(
				'select id, name from person where id like $1 or name like $1 limit 300', 
				['%' + name + '%']
			);
		} catch (e) {
			log.error('errored in list_fast : ' + e);
			throw e;
		}
	},

	/*
	 * name
	 * param : ids - list of IDs
	 */
	name : async ids => {
		try {
			return await db.any(
				'select id, name from person where id in ($1:csv)', [ids]
			);
		} catch (e) {
			log.error('errored in name : ' + e);
			throw e;
		}
	},

	/*
	 * isexist
	 * param : id
     */
	isexist : async id => {
		try {
			await db.one(
				'select id from person where id = $1', [id]
			);
			return true;
		} catch (e) {
			return false;
		}
	},

	/*
	 * register
	 * param : id, name, key, profile, tm
	 */
	register : async (id, name, key, profile, tm) => {
		try {
			return await db.none(
				'INSERT INTO person(id, name, key, profile, tm) VALUES($1, $2, $3, $4, $5)', 
				[id, name, key, profile, tm]
			);
		} catch (e) {
			log.error('errored in name : ' + e);
			throw e;
		}
	},	
}

