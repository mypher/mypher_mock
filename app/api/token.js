'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.token');
let sha256 = require('sha256');
let dcipher = require('../db/cipher');
let dtoken = require('../db/token')

module.exports = {
	/*
	 * add 
	 * param : name - filtering cond
	 */
	_add : async (sender, d)=> {
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
					{p:d.groupid, f:cmn.isKey},
					{p:d.name, f:cmn.isEmpty, r:true},
					{p:d.type, f:cmn.isSmallInt}
				])) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				d = cmn.toInt(d, ['type', 'firetype', 'noftoken', 'rewardtype', 'rcalctype', 'rquantity']);
				let tm = cmn.d2st(cmn.stdtm());
				let id = sha256('token' + d.groupid + d.name + tm);
				d.id = id;
				d.tm = tm;
				await dtoken.insert(d, t);
				response = id;
				return;
			});
			return response;
		} catch (e) {
			log.error('errored in add : ' + e);
			throw 'system error';
		}
	},

	/*
	 * load
	 * params : d.groupid, d.ver, d.draftno, d.id
	 */
	load : async d => {
		try {
			return await dtoken.load(d);
		} catch (e) {
			log.error('errored in load : ' + e);
		}
		return {code:'NOT_FOUND'};
	},

	/*
	 * list_fast
	 * params  : d.groupid, d.ver, d.draftno, d.name
	 */ 
	list_fast : async d => {
		try {
			return await dtoken.list_fast(d);
		} catch (e) {
			log.error('errored in load : ' + e);
			throw 'system error';
		}
	}

};
