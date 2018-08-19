// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

function User(d) {
	this.div = d.div;
	this.mode = d.mode;
	this.cb = d.cb;
}

User.prototype = {
	init : function() {
		return this.layout();
	},

	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/user.html', function() {
				var id = MODE_LABEL[self.mode];
				// ID
				({
					div : $(self.div.find('div[name="us_id"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('ID'));
					},
					ADD : function() {
						this.common();
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					},
					REF2 : function() {
						this.common();
					}
				})[id]();
				// NAME
				({
					div : $(self.div.find('div[name="us_name"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('NAME2'));
					},
					ADD : function() {
						this.common();
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					},
					REF2 : function() {
						this.div.css('display', 'none');
					}
				})[id]();
				// PASSWORD
				({
					div : $(self.div.find('div[name="us_pass"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('PASSWORD'));
					},
					ADD : function() {
						this.common();
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					},
					REF2 : function() {
						this.common();
					}
				})[id]();
				// CONFIRM
				({
					div : $(self.div.find('div[name="us_conf"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('PASS_FOR_CONF'));
					},
					ADD : function() {
						this.common();
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					},
					REF2 : function() {
						this.div.css('display', 'none');
					}
				})[id]();
				// DESCRIPTION
				({
					div : $(self.div.find('div[name="us_desc"]')[0]),
					common : function() {
						var lbl = this.div.find('label');
						$(lbl[0]).text(_L('DESC'));
					},
					ADD : function() {
						this.common();
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					},
					REF2 : function() {
						this.div.css('display', 'none');
					}
				})[id]();
				// BUTTON
				({
					div : $(self.div.find('div[name="us_button"]')[0]),
					common : function() {
					},
					ADD : function() {
						var btn = this.div.find('button');
						$(btn[0]).text(_L('REGISTER')).click(function() {
							self.cb(NOTIFY.CREATE);
						});
						$(btn[1]).text(_L('CANCEL')).click(function() {
							self.cb(NOTIFY.CANCEL);
						});
					},
					REF : function() {
						this.common();
					},
					EDIT : function() {
						this.common();
					},
					REF2 : function() {
						var btn = this.div.find('button');
						$(btn[0]).text(_L('LOGIN')).click(function() {
							self.cb(NOTIFY.COMMIT);
						});
						$(btn[1]).text(_L('CANCEL')).click(function() {
							self.cb(NOTIFY.CANCEL);
						});
					}
				})[id]();
				resolve();
			});
		});
	},
	get : function() {
		return {
			id : $(this.div.find('div[name="us_id"] input')[0]).val(),
			name : $(this.div.find('div[name="us_name"] input')[0]).val(),
			pass : $(this.div.find('div[name="us_pass"] input')[0]).val(),
			conf : $(this.div.find('div[name="us_conf"] input')[0]).val(),
			profile : $(this.div.find('div[name="us_desc"] textarea')[0]).val()
		};
	}
};


UserManager = {
	getKey : function(id, pass) {
		var k1 = id + pass;
		return Crypto.sighash(k1, k1);
	},
	getHash : function(d) {
		var ret = {
			tm : (new Date()).getTime()
		}
		var phrase = d.id + d.key + ret.tm;
		if (d.islogin) {
			var phrase = d.id + d.key + ret.tm;
			d.data = phrase;
			ret.id = d.id;
		} else {
			var user = this.user();
			var phrase = user.id + user.key + ret.tm;
			ret.id = user.id;
		
		}
		if (typeof(d.data)!=='string') {
			try {
				d.data = JSON.stringify(d.data);
			} catch (e) {
				d.data - '';
			}
		}
		ret.hash = Crypto.sighash(d.data, phrase);
		return ret;
	},
	login : function(div, cb) {
		var self = this;
		var proc = function(code) {
			if (code===NOTIFY.CANCEL) {
				cb&&cb(code);
			}
			if (code===NOTIFY.COMMIT) {
				var data = user.get();
				if (!self.validate(data, true)) {
					return false;
				}
				var key = self.getKey(data.id, data.pass);
				var hash = self.getHash({
					id : data.id,
					key : key,
					islogin : true
				});
				Rpc.call('person.login', [{
					id : data.id,
					tm : hash.tm,
					hash : hash.hash
				}], function(res) {
					if (res.result.code) {
						UI.alert(res.result.code);
						return;
					}
					if (res.result===true) {
						self.user = function() {
							return {
								id : data.id,
								key : key
							};
						};
						cb&&cb(NOTIFY.LOGIN);
					} else {
						UI.alert(_L('FAILED_TO_LOGIN'));
						return;
					}
				}, function(err) {
					UI.alert(err.message);
				});
				cb&&cb(code);
			}
		};
		var user = new User({
			div:div,
			mode:MODE.REF2,
			cb:proc
		});
		user.init();
	},
	logout : function() {
		this.user = undefined;
	},
	isLogin : function() {
		return (this.user!==undefined);
	},
	create : function(div, cb) {
		var self = this;
		var proc = function(code) {
			if (code===NOTIFY.CREATE) {
				var data = user.get();
				if (!self.validate(data)) {
					return false;
				}
				var key = self.getKey(data.id, data.pass);
				Rpc.call('person.register', [{
					id : data.id,
					name : data.name,
					key : key,
					profile : data.profile
				}], function(res) {
					if (res.result.code) {
						UI.alert(_L(res.result.code));
						return;
					}
					cb(NOTIFY.CREATE);
				});
			} else if (code===NOTIFY.CANCEL) {
				cb(NOTIFY.CANCEL);
			}
		}
		var user = new User({
			div:div,
			mode:MODE.NEW,
			cb:proc
		});
		user.init();
	},
	validate : function(data, min) {
		if (!min && data.pass!==data.conf) {
			UI.alert(_L('PASS_DIFFER_FROM_CONF'));
			return false;
		}
		if (!Validator.isAlphaNumeric(data.id)||data.id.length>16||data.id.length<6) {
			UI.alert(min ? _L('INVALID_ID_OR_PASS') : _L('ID_INVALID_FORM'));
			return false;
		}
		if (!Validator.isFitToPassword(data.pass)||data.pass.length>16||data.pass.length<6) {
			UI.alert(min ? _L('INVALID_ID_OR_PASS') :  _L('PASS_INVALID_FORM'));
			return false;
		}
		if (!min && data.name.length>32) {
			UI.alert(_L('NAME_INVALID_FORM'));
			return false;
		}
		return true;
	}
}
