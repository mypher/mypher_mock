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
	},

	/*
	 * _approvePic
	 * params : sender, d
	 */
/*	_approvePic : async (sender, d) => {
		try {
			let response = {};
			await db.tx(async t=>{
				let cur = await dtask.load(d, t);
				cur = cmn.null2Empty(cur);
				// check if sender can update
				if (!cmn.isMember(sender, cur.auth)) {
					response = {code:'NOT_HAVE_APPROVE_AUTH'};
					return;
				}
				// check id sender already voted
				let appdone = cmn.isMember(sender, cur.pic_approve);
				if (d.approve) {
					if (appdone) {
						response = {code:'ALREADY_APPROVED'};
						return;
					}
					cur.pic_approve = cmn.addMember(sender, cur.pic_approve);
				}
				if (!d.approve) {
					if (!appdone) {
						response = {code:'NOT_APPROVE_YET'};
						return;
					}
					cur.pic_approve = cmn.removeMember(sender, cur.pic_approve);
				}
				await dtask.approvePic(cur, t);
			});
			return response;
		} catch (e) {
			log.error('errored in _approvePic : ' + e);
			throw 'system error';
		}
	},

	/*
	 * _approveReview
	 * params : sender, d
	 */
/*	_approveReview : async (sender, d) => {
		try {
			let response = {};
			await db.tx(async t=>{
				let cur = await dtask.load(d, t);
				cur = cmn.null2Empty(cur);
				// check if sender can update
				if (!cmn.isMember(sender, cur.auth)) {
					response = {code:'NOT_HAVE_APPROVE_AUTH'};
					return;
				}
				// check id sender already voted
				let appdone = cmn.isMember(sender, cur.review);
				if (d.approve) {
					if (appdone) {
						response = {code:'ALREADY_APPROVED'};
						return;
					}
					cur.review = cmn.addMember(sender, cur.review);
				}
				if (!d.approve) {
					if (!appdone) {
						response = {code:'NOT_APPROVE_YET'};
						return;
					}
					cur.review = cmn.removeMember(sender, cur.review);
				}
				await dtask.approveReview(cur, t);
			});
			return response;
		} catch (e) {
			log.error('errored in _approvePic : ' + e);
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
				let response = await cmn.isEditable({
					id : ini.groupid,
					ver : ini.ver,
					draftno : ini.draftno,
					sender : sender
				}, t);
				if (response!==true) {
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
					if (!cmn.isEmpty(cur.pic)) {
						response = {code:'ALREADY_APPLIED'};
						return;
					}
					d.pic = sender;
				} else {
					if (sender!==cur.pic) {
						response = {code:'NOT_SET_TO_PIC'};
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
				// check if sender can update
				if (!cmn.isMember(sender, cur.auth)) {
					response = {code:'NOT_HAVE_APPROVE_AUTH'};
					return;
				}
				if (d.set) {
					if (cur.pic==='') {
						response = {code:'PIC_NOT_SET'};
						return;
					}
					if (cur.req===cmn.nofMember(cur.pic_approve)) {
						response = {code:'ALREADY_FULFILL_REQ'};
						return;
					}
					if (cmn.isMember(sender, cur.pic_approve)) {
						response = {code:'ALREADY_APPLIED'};
						return;
					}
					cur.pic_approve = cmn.addMember(sender, cur.pic_approve);
				} else {
					if (!cmn.isMember(sender, cur.pic_approve)) {
						response = {code:'NOT_APPROVE_YET'};
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
	 * _approveReview 
	 * params : sender, d.groupid, d.ver, d.draftno, d.set
	 */
	_approveReview : async (sender, d) => {
		try {
			let response = {};
			await db.tx(async t=>{
				let cur = await dtask.load(d, t);
				// check if sender can update
				if (!cmn.isMember(sender, cur.auth)) {
					response = {code:'NOT_HAVE_APPROVE_AUTH'};
					return;
				}
				if (!cmn.isCurrent(d, tx)) {
					response = {code:'NOT_CURRENT'};
				}
				if (d.set) {
					if (cur.req===cmn.nofMember(cur.review)) {
						response = {code:'ALREADY_FULFILL_REQ'};
						return;
					}
					if (cmn.isMember(sender, cur.review)) {
						response = {code:'ALREADY_APPLIED'};
						return;
					}
					cur.review = cmn.addMember(sender, cur.review);
				} else {
					if (!cmn.isMember(sender, cur.review)) {
						response = {code:'NOT_APPROVE_YET'};
						return;
					}
					cur.review = cmn.removeMember(sender, cur.review);
				}
				await dtask.approveReview(cur, t);
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


};
