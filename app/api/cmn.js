'use_strict'

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
			return (n>10) ? n : ('0' + n);
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
	}
};
