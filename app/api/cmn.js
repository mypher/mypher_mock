// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

'use_strict'

let db = require('../db/db');
//let cryptico = require('cryptico');
let dcipher = require('../db/cipher');

let an = /^[abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ_]*$/;
module.exports = {
	chkParams : (prm, req) => {
		for (let i in req) {
			if (req[i]===true&&prm[i]===undefined) return i;
		}
		return null;
	},

	fillParams : (prm, req) => {
		for (let i in req) {
			if (req[i]===false&&prm[i]===undefined) {
				prm[i] = '';
			}
		}
		return prm;
	},
	null2Empty : prm => {
		for (let i in prm) {
			if (prm[i]===null) {
				prm[i] = '';
			}
		}
		return prm;
	},

	chkEither : (prm, req) => {
		for (let i in req) {
			if (req[i]===false&&prm[i]!==undefined) {
				return true;
			}
		}
		return false;
	},

	buildUpdate : (tb, prm, flds) => {
		let ix = 1;
		let nms = [], ret = [], keys = [];
		for (let i in prm) {
			if (flds[i]===false) {
				nms.push(i + '=$' + (ix++));
				ret.push(prm[i]);
			} else if (flds[i]===true) {
				keys.push(i + '=$' + (ix++));
				ret.push(prm[i]);
			}
		}
		return {
			sql : 'update ' + tb + ' set ' + nms.join(', ') + ' where ' + keys.join(' and '),
			prm : ret
		};
	},

	stdtm : () => {
		let now = new Date();
		return new Date(now.getTime() + now.getTimezoneOffset()*60*1000);
	},

	d2st : (d) => {
		let sup = (n, l) => {
			return (n>9) ? n : ('0' + n);
		}
		try {
			return [
				sup(d.getFullYear()),
				sup(d.getMonth()+1),
				sup(d.getDate()),
				sup(d.getHours()),
				sup(d.getMinutes()),
				sup(d.getSeconds())
			].join('');
		} catch (e) {
			return '';
		}
	},

	isKey : d => {
		return (typeof(d)==='string') && (d.length===64);
	},

	isKeyOrEmpty : d => {
		return ((typeof(d)==='string') && (d.length===64)) || d==='';
	},

	isSmallInt : d => {
		try {
			var d = parseInt(d);
			return (-32768<=d)&&(d<=32767);
		} catch (e) {
			return false;
		}
		return true;
	},

	isEmpty : d => {
		return (typeof(d)!=='string') || (d.length===0);
	},

	chkTypes : p => {
		let ret = false;
		p.some(v=> {
			let f = v.r?v.r:false;
			ret = f ? v.f(v.p) : !v.f(v.p);
			return ret;  
		});
		return !ret;
	},

	toInt : (p, ar) => {
		ar.forEach(v => {
			p[v] = parseInt(p[v]);
			if (isNaN(p[v])) p[v] = null;
		});
		return p;
	},

	chkRule : async (req, auth) => {
		try {
			auth = auth.split(',');
			let cnt = await db.one(
				'select count(id) from person where id in ($1:csv)', [auth]
			);
			let dbcnt = parseInt(cnt.count);
			return (req<=dbcnt)&&(auth.length===dbcnt);
		} catch (e) {
			return false;
		}
	},
	chkMember : async list => {
		try {
			list = list.split(',');
			let cnt = await db.one(
				'select count(id) from person where id in ($1:csv)', [list]
			);
			let dbcnt = parseInt(cnt.count);
			return (list.length===dbcnt);
		} catch (e) {
			return false;
		}
	},

	isMember : (person, list) => {
		let ret = false;
		list.split(',').some(v=> {
			if (person===v) {
				ret = true;
				return true;
			}
		})
		return ret;
	},

	addMember : (person, list) => {
		if (list==='') return person;
		let found = false;
		list.split(',').some(v=> {
			if (v===person) {
				found = true;
				return true;
			}
		});
		return list + (found ? '' : (',' + person));
	},

	removeMember : (person, list) => {
		let ret = [];
		list.split(',').forEach(v=> {
			if (v!==person) {
				ret.push(v);
			}
		});
		return ret.join(',');
	},

	nofMember : list => {
		return (list==='') ? 0 : list.split(',').length;	
	},

	getReq : (base, list) => {
		return (base===0) ? list.split(',').length : base;
	},

	validate : (o1, o2) => {
		for (let i in o1) {
			if (o1[i]!=o2[i]) return false;
		}
		return true;
	},
	
	isAlphaNumeric : v => {
		return (v.match&&v.match(an));
	},

	chkStrLen : (v,min, max) => {
		return (typeof(v)==='string'&&v.length<=max&&v.length>=min);
	},
	
	decrypt : (data, key) => {
		// let rsa = new NodeRSA({b: 1024});
		// key = '-----BEGIN RSA PUBLIC KEY-----\n' + 
		// key = key.substring(  0, 64) + '\n' +
		// key.substring( 64,128) + '\n' +
		// key.substring(128) + '\n' +
		// '¥n-----END RSA PUBLIC KEY-----\n';
		// rsa.importKey(key, 'pkcs1-public-pem');
		// let rsa = new NodeRSA(key, 'pkcs1-public');
		// return rsa.decryptPublic(data, 'buffer');
		//return cryptico.decrypt(data,)
	},

/*	isEditable : async (d, tx) => {
		// check if draft can editable
		let result = await dcipher.isEditable(d, tx);
		switch (result) {
		case dcipher.NOT_EXIST:
			return {code:'NOT_EXIST'};
		case dcipher.NOT_EDITABLE:
			return {code:'NOT_EDITABLE'};
		default:
			break;
		}
		// check if sender can edit
		let ret = await dcipher.isEditor(d, tx);
		if (!ret) {
			return {code:'NOT_HAVE_UPDATE_AUTH'};
		}
		return true;
	},*/

	/*isCurrent : async (d, tx) => {
		let result = await dcipher.getCurrent(d, tx);
		return (d.ver===result.ver && d.draftno===result.draftno);
	}*/
	
};


