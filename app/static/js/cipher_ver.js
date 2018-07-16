// cipher_ver.js

function CipherVer(div, d, cb) {
	this.div = div;
	this.data = d;
	this.cb = cb;
}

CipherVer.prototype = {
	init : function() {
		return this.layout();
	},
	layout : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			self.div.load('parts/cipher_ver.html', function(res, status) {
				if (status==='error') {
					reject();
				}
				var onselect = function(sel) {
					if (!sel.id) return;
					var o = sel.id.split('_');
					self.cb(NOTIFY.SELECT, {id:o[0], ver:o[1], draftno:o[2]});
				};
				// FORMAL
				+function(){
					var div = $($('div[name="cp_formal"]')[0]);
					var lbl = div.find('label');
					var ctrl = div.find('.ctrl')[0];
					$(lbl[0]).text(_L('CURRENT1'));
					var list = new List( {
						div : $(ctrl),
						type : NOTIFY_LIST.SELECT,
						key : 'key',
						col : [
							{ width : 5, label : _L('VERSION'), name : 'ver'},
							{ width : 7, label : _L('DRAFT_NO'), name : 'draftno'}
						]
					}, function(evt, sel) {
						if (evt===NOTIFY_LIST.DATA) {
							list.show([self.data.formal]);
						} else if (evt===NOTIFY_LIST.SELECT) {
							onselect(sel);
						}
					});
				}();
				// DRAFT
				+function(){
					var div = $($('div[name="cp_draft"]')[0]);
					var lbl = div.find('label');
					var ctrl = div.find('.ctrl')[0];
					$(lbl[0]).text(_L('DRAFT1'));
					var list = new List( {
						div : $(ctrl),
						type : NOTIFY_LIST.SELECT,
						key : 'key',
						col : [
							{ width : 3, label : _L('VERSION'), name : 'ver'},
							{ width : 3, label : _L('DRAFT_NO'), name : 'draftno'},
							{ width : 6, label : _L('EDITOR'), name : 'editor'}
						]
					}, function(evt, sel) {
						if (evt===NOTIFY_LIST.DATA) {
							list.show(self.data.draft);
						} else if (evt===NOTIFY_LIST.SELECT) {
							onselect(sel);
						}
					});
				}();
				// HISTORY
				+function(){
					var div = $($('div[name="cp_history"]')[0]);
					var lbl = div.find('label');
					var ctrl = div.find('.ctrl')[0];
					$(lbl[0]).text(_L('HISTORY1'));
					var list = new List( {
						div : $(ctrl),
						type : NOTIFY_LIST.SELECT,
						key : 'key',
						col : [
							{ width : 3, label : _L('VERSION'), name : 'ver'},
							{ width : 3, label : _L('DRAFT_NO'), name : 'draftno'},
							{ width : 6, label : _L('EDITOR'), name : 'editor'}
						]
					}, function(evt, sel) {
						if (evt===NOTIFY_LIST.DATA) {
							list.show(self.data.history);
						} else if (evt===NOTIFY_LIST.SELECT) {
							onselect(sel);
						}
					});
				}();
				// BUTTON
				+function(){
					var div = $($('div[name="cp_button"]')[0]);
					var lbl = div.find('label');
					var btn = div.find('button');
					$(lbl[0]).text(_L('HISTORY1'));
					$(btn[0]).text(_L('CANCEL')).click(function() {
						self.cb(NOTIFY.CANCEL);
					});
				}();
				resolve();
			});
		});
	}
};


CipherVerManager = {
	ref : function(div, id, cb) {
		return Util.promise(function(resolve, reject) {
			Rpc.call('cipher.listVersion', [{id:id}], function(res) {
				var prm = {
					formal : null,
					draft : [],
					history : []
				};
				var pre = -1;
				for (var i in res.result) {
					var elm = res.result[i];
					elm.key = [elm.id, elm.ver, elm.draftno].join('_');
					if (prm.formal===null) {
						// previous version
						if ((elm.ver!==pre) && elm.formal) {
							prm.formal = elm;
						} else {
							prm.draft.push(elm);
						}
						pre = elm.ver;
					} else {
						prm.history.push(elm);
					}
				}
				var cipher = new CipherVer(div, prm, function(code, v) {
					cb(code, v);
				});
				cipher.init();
			});
		});
	}
};
