'use_strict'

let os = require('os');

let to = src => {
	return (typeof(src)==='string') ? new Buffer(src).toString('base64') : src;
}

let fr = src => {
	return ((typeof(src)==='string') || (src.constructor === Buffer)) ? new Buffer(src, 'base64').toString() : src;
}

module.exports = {
	str : {
		b2s : src => {
			return new Buffer(src).toString('utf-8');
		},
		s2b64 : src => {
			let ret;
			if (src.constructor === Array) {
				ret = [];
				src.forEach(elm => {
					ret.push(to(elm));
				});
			} else {
				ret = to(src);
			}
			return ret;
		},
		b642s : src => {
			let ret;
			if (src.constructor === Array) {
				ret = [];
				src.forEach(elm => {
					ret.push(fr(elm));
				});
			} else {
				ret = fr(src);
			}
			return ret;
		}
	},
	net : {
		local : () => {
			let ifs = os.networkInterfaces();
			let ret = {
				v4 : [],
				v6 : []
			};
			let map = {
				'IPv4' : 'v4',
				'IPv6' : 'v6'
			};
			for (let i in ifs) {
				ifs[i].forEach((elm) => {
					if (!elm.internal) {
						map[elm.family]&&ret[map[elm.family]].push(elm.address);
					}
				});
			}
			return ret;
		}
	}
}
