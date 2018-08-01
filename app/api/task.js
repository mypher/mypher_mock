'use_strict'

let db = require('../db/db');
let cmn = require('./cmn');
let log = require('../cmn/logger')('api.task');
let sha256 = require('sha256');

let dtask = require('../db/task');
let dcipher = require('../db/cipher');
let vtask = require('../validator/task');
let vcipher = require('../validator/cipher');

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
				// load cipher to which task belongs
				let cdata = await dcipher.load({
					id : d.groupid,
					ver : d.ver,
					draftno : d.draftno
				});
				// check if cipher can be edited
				response = vcipher.isEditableVer(cdata);
				if (response.code) {
					return;
				}
				// if sender is not editor, task can't be updated
				response = vcipher.isEditor(sender, cdata);
				if (response.code) {
					return;
				}
				d = cmn.fillParams(d,{
					groupid : false, 
					name : false, 
					description : false,
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
				response = id;
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
	},

	/*
	 * _commit
	 * param : sender, ini, cur
	 */
	_commit : async (sender, ini, cur) => {
		let validate = async function(tx) {
			let d = await dtask.load(ini, tx);
			return cmn.validate(d, ini);
		}
		try {
			let response = {};
			await db.tx(async t=>{
				// check if data is changed while editing
				let ret = await validate(t);
				if (!ret) {
					response = {code:'ALREADY_CHANGED'};
					return;
				}
				// load cipher to which task belongs
				let cdata = await dcipher.load({
					id : ini.groupid,
					ver : ini.ver,
					draftno : ini.draftno
				});
				// check if task can be edited
				response = vtask.isEditable(cdata, ini, sender);
				if (response.code) {
					return;
				}
				// if sender is not editor, task can't be updated
				response = vcipher.isEditor(sender, cdata);
				if (response.code) {
					return;
				}
				cur = cmn.fillParams(cur,{
					groupid : false, 
					name : false, 
					description : false,
					ruleid : false,
					rewardid : false,
					pic : false,
				});
				if (!cmn.chkTypes([
					{p:cur.groupid, f:cmn.isKey},
					{p:cur.ver, f:cmn.isSmallInt},
					{p:cur.draftno, f:cmn.isSmallInt},
					{p:cur.name, f:cmn.isEmpty, r:true},
					{p:cur.ruleid, f:cmn.isKeyOrEmpty},
					{p:cur.rewardid, f:cmn.isKeyOrEmpty}
				])) {
					response = {code:'INVALID_PARAM'};
					return;
				}
				// update
				await dtask.update(cur, t);
			}).then(function() {
			}).catch(function() {
				response = {code:'INVALID_PARAM'};
			});
			return response;
		} catch (e) {
			log.error('errored in _commit : ' + e);
			throw 'system error';
		}
	},
	/*
	 * _applyPic 
	 * params : sender, d.groupid, d.ver, d.draftno, d.set
	 */
	_applyPic : async (sender, d) => {
		try {
			let response = {};
			await db.tx(async t=>{
				let cur = await dtask.load(d, t);
				if (d.set) {
					// check if sender can apply to pic
					response = vtask.canApplyToPic(cur);
					if (response.code) {
						return;
					}
					d.pic = sender;
				} else {
					// check if sender can cancel application 
					response = vtask.canCancelPic(cur, sender);
					if (response.code) {
						return;
					}
					d.pic = '';
				}
				await dtask.applyPic(d, t);
			}).then(function() {
			}).catch(function() {
				response = {code:'INVALID_PARAM'};
			});
			return response;
		} catch (e) {
			log.error('errored in _commit : ' + e);
			throw 'system error';
		}		
	},

	/*
	 * _approvePic 
	 * params : sender, d.groupid, d.ver, d.draftno, d.set
	 */
	_approvePic : async (sender, d) => {
		try {
			let response = {};
			await db.tx(async t=>{
				let cur = await dtask.load(d, t);
				// load cipher to which task belongs
				let cdata = await dcipher.load({
					id : d.groupid,
					ver : d.ver,
					draftno : d.draftno
				});
				if (d.set) {
					// check if sender can approve pic
					result = vtask.canApprovePic(cdata, cur, sender);
					if (result.code) {
						return;
					}
					cur.pic_approve = cmn.addMember(sender, cur.pic_approve);
				} else {
					// check if sender can cancel approvement
					result = vtask.canCancelApprovementPic(cdata, cur,sender);
					if (result.code) {
						return;
					}
					cur.pic_approve = cmn.removeMember(sender, cur.pic_approve);
				}
				await dtask.approvePic(cur, t);
			}).then(function() {
			}).catch(function() {
				response = {code:'INVALID_PARAM'};
			});
			return response;
		} catch (e) {
			log.error('errored in _commit : ' + e);
			throw 'system error';
		}		
	},

	/*
	 * _approveResults 
	 * params : sender, d.groupid, d.ver, d.draftno, d.set
	 */
	_approveResults : async (sender, d) => {
		try {
			let response = {};
			await db.tx(async t=>{
				let cur = await dtask.load(d, t);
				// load cipher to which task belongs
				let cdata = await dcipher.load({
					id : d.groupid,
					ver : d.ver,
					draftno : d.draftno
				});
				if (d.set) {
					// check if sender can approve results
					response = vtask.canApproveResults(cdata, cur, sender);
					if (response.code) {
						return;
					}
					cur.review = cmn.addMember(sender, cur.review);
				} else {
					// check if sender can cancel
					response = vtask.canCancelApprovementResults(cdata, cur, sender);
					if (response.code) {
						return;
					}
					cur.review = cmn.removeMember(sender, cur.review);
				}
				await dtask.approveResults(cur, t);
			}).then(function() {
			}).catch(function() {
				response = {code:'INVALID_PARAM'};
			});
				return response;
		} catch (e) {
			log.error('errored in _commit : ' + e);
			throw 'system error';
		}		
	},

	/**
	 * listbywords
	 * params : d
	 */
	listbywords : async d => {
		try {
			return await dtask.listbywords(d.words);
		} catch (e) {
			log.error('errored in listbywords : ' + e);
			throw 'system error';
		}
	}

};
