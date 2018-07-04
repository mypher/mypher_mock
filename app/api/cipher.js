'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.cipher');
let sha256 = require('sha256');
let dcipher = require('../db/cipher');
let dtask = require('../db/task');
let drule = require('../db/rule');
let dtoken = require('../db/token');

module.exports = {
	/*
	 * _new 
	 * param : sender, d.name, d.purpose, d.drule_req, d.drule_auth, d.editor
	 *         drule
	 */
	_new : async (sender, d)=> {
		let tm = cmn.d2st(cmn.stdtm());
		let id = sha256('cipher' + d.name + tm);
		try {
			if (!cmn.chkTypes([
				{p:d.name, f:cmn.isEmpty, r:true},
				{p:d.drule_req, f:cmn.isSmallInt},
				{p:d.drule_auth, f:cmn.isEmpty, r:true}
			])) {
				return {code:'INVALID_PARAM'};
			}
			let ret = await cmn.chkRule(d.drule_req, d.drule_auth);
			if (!ret) {
				return {code:'INVALID_PARAM'};
			}
			ret = await cmn.chkMember(d.editor);
			if (!ret) {
				return {code:'INVALID_PARAM'};
			}
			await db.tx(async t=>{
				d.id = id;
				d.tm = tm;
				await dcipher.insert(d, t);
			});
			return id;
		} catch (e) {
			log.error('errored in _new : ' + e);
			throw 'system error';
		}
	},
	/*
	 * load
	 * param : d.id, d.ver, d.draftno
	 */
	load : async d => {
		try {
			return await dcipher.load(d);
		} catch (e) {
			return {code : 'NOT_EXIST'};
		}
	},
	/*
	 * _commit
	 * param : sender, ini, cur
	 */
	_commit : async (sender, ini, cur) => {
		let validate = async function() {
			let d = await dcipher.load(ini);
			return cmn.validate(d, ini);
		}
		try {
			// check if sender can update
			if (!cmn.isMember(sender, cur.editor)) {
				return {code:'NOT_HAVE_UPDATE_AUTH'};
			}
			// check if data is changed while editing
			let ret = await validate();
			if (!ret) {
				return {code:'ALREADY_CHANGED'};
			}
			// check the data for updating
			if (!cmn.chkTypes([
				{p:cur.name, f:cmn.isEmpty, r:true},
				{p:cur.drule_req, f:cmn.isSmallInt},
				{p:cur.drule_auth, f:cmn.isEmpty, r:true}
			])) {
				return {code:'INVALID_PARAM'};
			}
			ret = await cmn.chkRule(cur.drule_req, cur.drule_auth);
			if (!ret) {
				return {code:'INVALID_PARAM'};
			}
			ret = await cmn.chkMember(cur.editor);
			if (!ret) {
				return {code:'INVALID_PARAM'};
			}
			// update
			ret = null;
			await db.tx(async t=>{
				await dcipher.update(cur, t);
			}).then(function() {
				ret = {};
			}).catch(function() {
				ret = {code:'INVALID_PARAM'};
			});
			return ret;
		} catch (e) {
			log.error('errored in _commit : ' + e);
			throw 'system error';
		}
	},

	/*
	 * _approve
	 * params : d.id, d.ver, d.draftno, d.approve, sender
	 */
	_approve : async (sender, d) => {
		try {
			let response = {};
			await db.tx(async t=>{
				let cur = await dcipher.load(d, t);
				cur = cmn.null2Empty(cur);
				// check if sender can update
				if (!cmn.isMember(sender, cur.drule_auth)) {
					response = {code:'NOT_HAVE_APPROVE_AUTH'};
					return;
				}
				// check if alredy been formal
				if (cur.formal) {
					response = {code:'ALREADY_BEEN_FORMAL'};
					return;
				}
				// check id sender already voted
				let appdone = cmn.isMember(sender, cur.approved);
				if (d.approve) {
					if (appdone) {
						response = {code:'ALREADY_APPROVED'};
						return;
					}
					cur.approved = cmn.addMember(sender, cur.approved);
				}
				if (!d.approve) {
					if (!appdone) {
						response = {code:'NOT_APPROVE_YET'};
						return;
					}
					cur.approved = cmn.removeMember(sender, cur.approved);
				}
				cur.formal = (cmn.getReq(cur.drule_req, cur.drule_auth)===cmn.nofMember(cur.approved));
				await dcipher.approve(cur, t);
			});
			return response;
		} catch (e) {
			log.error('errored in _approve : ' + e);
			throw 'system error';
		}
	},

	/*
	 * _newdraft
	 * params : d.id, d.ver, d.draftno, sender
	 */
	_newdraft : async (sender, d) => {
		try {
			let response = null;
			await db.tx(async t=>{
				if (!await dcipher.isExist(d, t)) {
					response = {code : 'NOT_EXIST'};
					return;
				}
				let rec = await dcipher.getLatestFormalVersion(d, t);
				if (rec!==null) {
					// a draft whose version is bigger than latest formal version can be used for source.
					if (rec.ver<=d.ver) {
						// only formal one of latest version can be used for source.
						if (rec.ver!==d.ver || rec.draftno!==d.draftno) {
							response = {code : 'CANT_USE_FOR_SOURCE'};
							return;
						}
					}
				}
				let to = await dcipher.newDraft(d, t);
				to.tm = cmn.d2st(cmn.stdtm());
				to.sender = sender;
				await dcipher.copy(d, to, t);
				await dtask.copy(d, to, t);
				await drule.copy(d, to, t);
				await dtoken.copy(d, to, t);
				response = to;
				return;
			});
			return response;
		} catch(e) {
			log.error('errored in _newdraft : ' + e);
			throw 'system error';
		}
	}
};
