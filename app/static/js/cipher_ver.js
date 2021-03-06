// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

// cipher_ver.js

function CipherVer(d, cb) {
	this.div = d.div;
	this.key = d.key;
	this.cb = cb;
}

CipherVer.prototype = {
	draw : function() {
		var self = this;
		return self.layout().then(function() {
			return self.load().then(function() {
				return Util.promise(function(resolve) {
					self.cb(NOTIFY.REDRAW);
					resolve();
				});
			});
		});
	},
	layout : function() {
		var self = this;
		return Util.load(self.div, 'parts/cipher_ver.html', function(resolve) {
			var onselect = function(sel) {
				if (!sel.id) return;
				var o = sel.id.split('_');
				self.cb(NOTIFY.SELECT, {id:o[0], ver:o[1], draftno:o[2]});
			};
			// FORMAL
			var div = self.div.find('div[name="cp_formal"]:eq(0)');
			div.find('label:eq(0)').text(_L('CURRENT1'));
			// DRAFT
			var div = self.div.find('div[name="cp_draft"]:eq(0)');
			div.find('label:eq(0)').text(_L('DRAFT1'));
			// HISTORY
			var div = self.div.find('div[name="cp_history"]:eq(0)');
			div.find('label:eq(0)').text(_L('HISTORY1'));
			// BUTTON
			var div = self.div.find('div[name="cp_button"]:eq(0)');
			div.find('label:eq(0)').text(_L('HISTORY1'));
			div.find('button:eq(0)').text(_L('BACK')).click(function() {
				History.back();
			});
			resolve();
		});
	},
	load : function() {
		var self = this;
		return Util.promise(function(resolve, reject) {
			Rpc.call('cipher.listVersion', [{id:self.key.id}], function(res) {
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
				self.set(prm);
				resolve();
			});
		});
	},
	set : function(d) {
		var self = this;
		var onselect = function(sel) {
			if (!sel.id || !sel.ver || !sel.draftno) return;
			self.cb(NOTIFY.SELECT, {id:sel.id, ver:sel.ver, draftno:sel.draftno});
		};
		self.data = d;
		// FORMAL
		var ctrl = self.div.find('div[name="cp_formal"] .ctrl:eq(0)');
		var formal = new List({
			div : ctrl,
			type : NOTIFY.SELECT,
			key : 'key',
			col : [
					{ width : 5, label : _L('VERSION'), name : 'ver'},
					{ width : 7, label : _L('DRAFT_NO'), name : 'draftno'}
				]
		}, function(evt, sel) {
			if (evt===NOTIFY.DATA) {
				if (d.formal) {
					formal.show([d.formal]);
				} else {
					formal.show([]);
				}
			} else if (evt===NOTIFY.SELECT) {
				onselect(sel);
			}
		});
		// DRAFT
		ctrl = self.div.find('div[name="cp_draft"] .ctrl:eq(0)');
		var draft = new List({
			div : ctrl,
			type : NOTIFY.SELECT,
			key : 'key',
			col : [
				{ width : 3, label : _L('VERSION'), name : 'ver'},
				{ width : 3, label : _L('DRAFT_NO'), name : 'draftno'},
				{ width : 6, label : _L('EDITOR'), name : 'editor'}
			]
		}, function(evt, sel) {
			if (evt===NOTIFY.DATA) {
				if (self.data.draft) {
					draft.show(self.data.draft);
				} else {
					draft.show([]);
				}
			} else if (evt===NOTIFY.SELECT) {
				onselect(sel);
			}
		});
		// HISTORY
		ctrl = self.div.find('div[name="cp_history"] .ctrl:eq(0)');
		var hist = new List( {
			div : ctrl,
			type : NOTIFY.SELECT,
			key : 'key',
			col : [
				{ width : 3, label : _L('VERSION'), name : 'ver'},
				{ width : 3, label : _L('DRAFT_NO'), name : 'draftno'},
				{ width : 6, label : _L('EDITOR'), name : 'editor'}
			]
		}, function(evt, sel) {
			if (evt===NOTIFY.DATA) {
				if (self.data.history) {
					hist.show(self.data.history);
				} else {
					hist.show([]);
				}
			} else if (evt===NOTIFY.SELECT) {
				onselect(sel);
			}
		});
	}
};

