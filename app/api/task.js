'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.task');
let sha256 = require('sha256');

let dcipher = require('../db/cipher');
let dtask = require('../db/task');

module.exports = {
	/*
	 * _add 
	 * params : d.groupid, d.ver, d.draftno, d.name, d.ruleid, d.rewardid
	 *          d.quantity, sender
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
				d = cmn.fillParams(d,{
					groupid : false, 
					name : false, 
					desc : false,
					ruleid : false,
					rewardid : false,
					pic : false,
				});
				if (!cmn.chkTypes([
					{p:d.groupid, f:cmn.isKey},
					{p:d.ver, f:cmn.isSmallInt},
					{p:d.draftno, f:cmn.isSmallInt},
					{p:d.name, f:cmn.isEmpty, r:true},
					{p:d.ruleid, f:cmn.isKeyOrEmpty},
					{p:d.rewardid, f:cmn.isKeyOrEmpty}
				])) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				let tm = cmn.d2st(cmn.stdtm());
				let id = sha256('task' + d.groupid + d.name + tm);
				d.rquantity = d.rquantity===undefined ? 0 : d.rquantity;
				d.id = id;
				d.tm = tm;
				await dtask.insert(d, t)
				respnse = id;
			});
			return response;
		} catch (e) {
			log.error('errored in _add : ' + e);
			throw 'system error';
		}
	},

	/*
	 * load
	 * params : d.groupid, d.ver, d.draftno, d.id
	 */
	load : async d => {
		try {
			return await dtask.load(d);
		} catch (e) {
			log.error('errored in load : ' + e);
		}
		return {code:'NOT_FOUND'};
	},

	/*
	 * list_fast
	 * params : d.groupid, d.ver, d.draftno, d.name
	 */
	list_fast : async d => {
		try {
			return await dtask.list_fast(d);
		} catch (e) {
			log.error('errored in list_fast : ' + e);
			throw 'system error';
		}
	}

};
