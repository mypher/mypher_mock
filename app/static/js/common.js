MODE = {
	NEW : 1,
	REF : 2,
	EDIT : 3,
	REF2 : 4
};
var MODE_LABEL = {};
MODE_LABEL[MODE.NEW] = 'ADD';
MODE_LABEL[MODE.REF] = 'REF';
MODE_LABEL[MODE.EDIT] = 'EDIT';
MODE_LABEL[MODE.REF2] = 'REF2';

NOTIFY = {
	CANCEL : 0,
	CREATE : 1,
	EDIT : 2,
	COMMIT : 3,
	LOGIN : 4,
	APPROVE : 5,
	SELECT : 6,
	SEARCH : 7,
	VERSION : 8,
	BACK : 9,
	INIT : 10,
	REDRAW : 11,
	DATA : 13
}

var module = {};

Rpc = {
	SV_URL : '',
	getId : function() {
		return Math.floor( Math.random() * 0x8000000000000000 );
	},
	call : function(method, param, cb, cberr, bNoModal) {
		var name = this.call.caller.name;
		var getMsg = function(val) {
			var sep = '&nbsp;:&nbsp;';
			if (isEmpty(val)) return val;
			return val + '&nbsp;(' + name + sep + method + ')';
		}
		var data = {
			'jsonrpc':'2.0',
			'id':Rpc.getId(),
			'method':method,
			'params':param
		};
		var m = method.split('.');
		if (m[1][0]==='_') {
			if (UserManager.isLogin()) {
				data.auth = UserManager.getHash({data:JSON.stringify(param)});
			}
		}
		if (!cberr) {
			cberr = function(msg) {
				UI.alert(msg);
			}
		}
		var retry = 0;
		var call = function() {
			$.ajax({
				type: "POST",
				url: 'http://' + location.host + '/RPC',
				data: JSON.stringify(data),
				dataType: 'json',
				contentType: "application/json"
			}).then(ret => {
				if (ret.error) {
					cberr&&cberr(ret.error);
				} else {
					cb&&cb(ret);
				}
			}, ret => {
				retry++;
				if (ret.statusText=='Not Found') {
					if (retry==2) {
						msg = 'エラーが発生しました。';
					} else {
						window.setTimeout(call, 500);
						return;
					}
				} else if (ret.statusText=='error') {
					if (retry==3) {
						msg = 'エラーが発生しました。';
					} else {
						window.setTimeout(call, 500);
						return;
					}
				}
				alert(msg);
			});
		}
		call();
	}
};

var Base64 = {
	encode: function(str) {
		return btoa(unescape(encodeURIComponent(str)));
	},
	decode: function(str) {
		return decodeURIComponent(escape(atob(str)));
	}
};

var Validator = {
	an : /^[abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ_]*$/,
	ps : /^[abcdefghijklmnopqrstuvwxyz1234567890!"#$%&'\(\)\+\-\*\?]*$/,
	isAlphaNumeric : function(v) {
		return (v.match&&v.match(this.an));
	},
	isFitToPassword : function(v) {
		return (v.match&&v.match(this.ps));
	}
};

var Crypto = {
	hash : function(word) {
		return Sha256.hash(word);
	},
	sighash : function(word, phrase) {
		var ret = Sha256.hash(word+phrase);
		return Sha256.hash(ret + phrase);
	}
}

var UI = {
	setClass : function(elm, cls) {
		cls = cls.split(' ');
		for (var i in cls) {
			if (cls[i].length>0) {
				elm.classList.add(cls[i]);
			}
		}
	},

	createDiv : function(cls, id) {
		var ret = document.createElement('div');
		UI.setClass(ret, cls);
		if (id) ret.id = id;
		return ret;
	},

	createBtn : function(cls, face, id) {
		var ret = document.createElement('input');
		ret.type = 'button';
		ret.value = face;
		UI.setClass(ret, cls);
		if (id) ret.id = id;
		return ret;
	},

	createRadio : function(name, label, vals) {
		var ret = $('<div><label>' + label + '</label></div>');
		for ( var i=0; i<vals.length; i++) {
			ret.append($('<label class="radio-inline"><input type="radio" name="' + name + '" value="' + vals[i].val + '">&nbsp;' + vals[i].label + '</label>'));
		}
		return ret;
	},

	append : function(parent, childs) {
		for ( var i in childs ) {
			parent.appendChild(childs[i]);
		}
	},

	popup : function(w, h) {
		var ws = {
			w : $(window).width(),
			h : $(window).height()
		};
		var index = 1000 + $('.popup').length*2;
		ws.cx = ws.w / 2;
		ws.cy = ws.h / 2;
		w = (ws.w < w) ? ws.w : w;
		h = (ws.h < h) ? ws.h : h;
		var popup = $('<div>').css({
			width : w + 'px',
			height : h + 'px',
			left : ((ws.w-w)/2) + 'px',
			top : ((ws.h-h)/2) + 'px',
			position : 'fixed',
			'z-index' : index
		}).addClass('popup');
		var popupback = $('<div>').addClass('popupback').css({
			'z-index' : index -1
		}).click(function() {
			UI.closePopup();
		});
		$('body').append(popupback);
		$('body').append(popup);
		return popup;
	},

	closePopup : function() {
		var popup = $('.popup');
		var popupback = $('.popupback');
		if (popup.length>0) {
			$(popup[popup.length-1]).remove();
		}
		if (popupback.length>0) {
			$(popupback[popupback.length-1]).remove();
		}
	},
	alert : function(msg) {
		var l = _L(msg);
		var div = UI.popup(400, 150);
		div.text(l ? l : msg);
	},

	setMainDiv : function(div) {
		this.maindiv = div;
	},

	getMainDiv : function(div) {
		return this.maindiv;
	}
};

var Util = {
	// TODO:localize format
	svTime2Local : function(d) {
		var padZero = function(v) {
			return (v<10) ? '0'+v : v;
		};
		try {
			var psd = /([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/.exec(d);
			var t = [psd[1], '/', psd[2], '/', psd[3], ' ', psd[4], ':', psd[5], ':', psd[6]].join('');
			var d = new Date(t);
			d.setTime(d.getTime()-(d.getTimezoneOffset()*60*1000));
			return [padZero(d.getFullYear()), '/', padZero(d.getMonth()+1), '/', 
					padZero(d.getDate()), ' ', padZero(d.getHours()), ':', 
					padZero(d.getMinutes()), ':', padZero(d.getSeconds())].join('');
		} catch (e) {
		}
		return '';
	},
	sanitize : function(t) {
		let ret = jQuery('<span/>').text(t).html();
		return ret.replace(/¥n/mg, '<br>');
	},
	N : {
	},
	name : function(ids) {
		return new Promise(function(resolve, reject) {
			var req = [];
			var ret = {};
			for ( var i in ids ) {
				if (Util.N[ids[i]]) {
					ret[ids[i]] = Util.N[ids[i]];
				} else {
					req.push(ids[i]);
					ret[ids[i]] = 'name not found';
				}
			}
			if (req.length===0) {
				resolve(ret);
				return;
			}
			Rpc.call('person.name', [req], function(res) {
				for (var i=0; i<res.result.length; i++) {
					var elm = res.result[i];
					ret[elm.id] = elm.name;
					Util.N[elm.id] = elm.name;
				}
				resolve(ret);
			}, function(err) {
				reject(err.message);
			}, function(fail) {
				reject(err.message);
			});
		});
	}, 
	wait_default : 2000,
	promise : function(func, timeout) {
		if (timeout===undefined) timeout = Util.wait_default;
		return new Promise(function(resolve, reject) {
			window.setTimeout(function() {
				reject('timeout');
			}, timeout);
			func(resolve, reject);
		});
	},
	text : function(text) {

	},
	split : function(v) {
		if (typeof(v)!=='string') {
			return [];
		}
		var ret = v.split(',');
		for ( var i in ret ) {
			ret[i] = ret[i].trim();
		}
		return ret;
	},
	load : function(div, file, cb) {
		div.empty();
		return Util.promise(function(resolve, reject) {
			div.load(file, function(res, status) {
				if (status==='error') {
					reject();
				}
				cb(resolve, reject);
			});
		});
	},
	initDiv : function(div, mode, btns) {
		div.find('*[disable_on]').prop('disabled', false);
		div.find("*[hide_on]").css('display', '');
		switch (mode) {
		case MODE.NEW:
			div.find('*[disable_on*=add]').prop('disabled', true);
			div.find("*[hide_on*=add]").css('display', 'none');
			break;
		case MODE.EDIT:
			div.find('*[disable_on*=edit]').prop('disabled', true);
			div.find('*[hide_on*=edit]').css('display', 'none');
			break;
		case MODE.REF:
			div.find('*[disable_on*=ref]').prop('disabled', true);
			div.find('*[hide_on*=ref]').css('display', 'none');
			break;
		}
		var l = div.find('*[ltext]');
		for ( var i=0; i<l.length; i++ ) {
			var elm = l.eq(i);
			elm.text(_L(elm.attr('ltext')));
		}
		l = div.find('div[btnproc]');
		for ( var i=0; i<l.length; i++ ) {
			var elm = l.eq(i);
			Util.initButton(elm.find('button'), btns[elm.attr('btnproc')]);
		}
	},
	initButton : function(btns, arr) {
		var len = btns.length;
		var start = len - arr.length;
		for ( var i=0; i<start; i++ ) {
			btns.eq(i).css('display', 'none');
		}
		for ( var i=0; i<arr.length; i++) {
			var elm = btns.eq(start + i).css('display', '');
			if (arr[i].text) {
				elm.text(_L(arr[i].text));
			}
			if (arr[i].click) {
				elm.click(arr[i].click);
			}
		}
	},
	setData : function(div, d) {
		for ( var i in d ) {
			var dd = d[i];
			var elms = div.find('label[field=' + i + '],span[field=' + i + ']');
			if (elms.length>0) {
				elms.text(dd);
				continue;
			}
			elms = div.find('input[type="text"][field=' + i + ']');
			if (elms.length>0) {
				elms.val(dd);
				continue;
			}
			elms = div.find('textarea[field=' + i + ']');
			if (elms.length>0) {
				elms.val(dd);
				continue;
			}
			elms = div.find('*[subfield^=' + i + ']');
			if (elms.length>0) {
				for ( var i=0; i<elms.length; i++ ) {
					var elm = elms.eq(i);
					var val = elm.attr('subfield').split('=');
					if (val.length!==2) continue;
					elm.attr(val[1], dd);
				}
				continue;
			}
			elms = div.find('select[field=' + i + ']');
			if (elms.length>0) {
				elms.eq(0).val(dd).change();
				continue;
			}
			elms = div.find('input[type="radio"][field=' + i + ']');
			var dis = div.find('input[type="radio"][field=' + i + ']:disabled')
					.prop('disabled', false);
			try {
				for ( var i=0; i<elms.length; i++) {
					var r = elms.eq(i);
					if (parseInt(r.val())===parseInt(dd)) {
						r.click();
						break;
					}
				}
			} catch (e) {
				// nothing
			}
			dis.prop('disabled', true);
		}
	},
	getData : function(div, base) {
		var elms = div.find('[field]:not([type="radio"])');
		for ( var i=0; i<elms.length; i++ ) {
			var elm = elms.eq(i);
			var tagname = elm.prop('tagName');
			if (tagname==='LABEL') {
				base[elm.attr('field')] = elm.text();
			} else {
				base[elm.attr('field')] = elm.val();
			}
		}
		elms = div.find('.active [field][type="radio"]');
		for ( var i=0; i<elms.length; i++ ) {
			var elm = elms.eq(i);
			base[elm.attr('field')] = elm.val();
		}

		elms = div.find('*[subfield]');
		for ( var i=0; i<elms.length; i++ ) {
			var elm = elms.eq(i);
			var attr = elm.attr('subfield').split('=');
			if (attr.length!==2) continue;
			base[attr[1]] = elm.attr(attr[0]);
		}
		return base;
	}
};



var CHECK = {
	isNum : function(p) {
		try {
			return (NaN!==parseInt(p));
		} catch(e) {
			return false;
		}
	},
	isNotEmpty : function(p) {
		return p&&p.length&&p.length>0;
	},
	all : function(p, f) {
		for ( var i in p ) {
			if (!f[i](p[i])) return false;
		}
		return true;
	}
}
