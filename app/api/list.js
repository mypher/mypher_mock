'use_strict'

let log = require('../cmn/logger')('api.list');

module.exports = {
	cls : {
		talk : require('./talk'),
		person  : require('./person'),
		rule  : require('./rule')
	},
	call : async function (cn, mn, params) {
		log.debug('api.call:' + cn + ':' + mn);
		let cls = this.cls[cn];
		if (cls===undefined||cls[mn]===undefined) {
			throw 'api not found';
		}
		try {
			return await cls[mn](...params);
		} catch (e) {
			throw e;
		}
	}
};
