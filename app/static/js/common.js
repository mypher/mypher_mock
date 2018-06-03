Rpc = {
	SV_URL : '',
	getId : function() {
		return Math.floor( Math.random() * 0x8000000000000000 );
	},
	call : function(method, param, cb, cberr, failcb, bNoModal) {
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
		if (failcb===failcb||type(failcb)!=='function') {
			failcb = function(jqXHR, textStatus, errorThrown) {};
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
					cberr(ret.error);
				} else {
					cb(ret);
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
		$('body').append($('<div>').addClass('popupback').css({
			'z-index' : index -1
		}));
		$('body').append(popup);
		return popup;
	},

	closePopup : function() {
		var popup = $('.popup');
		var popupback = $('.popupback')
		if (popup.length>0) {
			popup.remove();
		}
		if (popupback.length>0) {
			popupback.remove();
		}
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
	promise : function(func, timeout) {
		return new Promise(function(resolve, reject) {
			window.setTimeout(function() {
				reject('timeout');
			}, timeout);
			func(resolve, reject);
		});
	},
	text : function(text) {

	}
};
