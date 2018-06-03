
function GovRule(div, data, editable) {
	this.div = div;
	this.editable = editable;
	this.init();
	if (data&&data.auth) {
		this.data = data;
		if (data.auth.length&&data.auth.length>0) {
			var self = this;
			Util.name(data.auth).then(function(names) {
				self.data.auth = names;
				self.layout();
			}).catch(function(err) {
				console.log(err);
				self.data.auth = {};
				self.layout();
			});
		}	
		if (isNaN(parseInt(this.data.req))) {
			this.data.req = 0;
		}
	} else {
		this.data = {
			groupid : data.groupid,
			id : data.id,
			req : 0,
			auth : {}
		}
		this.layout();
	}
}


GovRuleMgr = {
	make : function(div, data, editable) {
		return Util.promise(function(resolve, reject) {
			if (!data.groupid) {
				reject('data.groupid not specified');
			}
			if (data.id) {
				Rpc.call('rule.get', [data.groupid, data.id], function(res) {
					data.req = res.result.req;
					data.name = res.result.name;
					data.auth = res.result.auth.split(',');
					resolve(new GovRule(div, data, editable));
				}, function(err) {
					reject(err.message);
				}, function(fail) {
					reject(err.message);
				});
			} else {
				resolve(new GovRule(div, data, editable));
			}
		}, 2000);
	},

	commit : function(gov) {
		return Util.promise(function(resolve, reject) {
			var data = gov.get();
			var auth = Array.isArray(data.auth) ? data.auth.join(',') : '';
			Rpc.call('rule.add', [data.groupid, data.name, data.req, auth], function(res) {
				resolve(res.result);
			}, function(err) {
				reject(err.message);
			}, function(fail) {
				reject(err.message);
			});
		}, 2000);
	}
}


GovRule.prototype = {
	init : function() {
	},

	getChildRect : function(w,h) {
		var ws = {
			w : $(window).width(),
			h : $(window).height()
		};
		var ms = {
			lt : this.div.offset(),
			w : this.div.width(),
			h : this.div.height()
		};
		w = (ws.w < w) ? ws.w : w;
		h = (ws.h < h) ? ws.h : h;
		var l = (ms.lt.left + ms.w / 2) - w / 2;
		var t = (ms.lt.top + ms.h / 2) - h / 2;
		l = (l < 0) ? 0 : l;
		t = (t < 0) ? 0 : t;
		return {left:l, top:t, width:w, height:h, position:'fixed'};
	},

	layout : function() {
		var self = this;
		this.div.empty().addClass('govrule').load('parts/govrule.html', function() {
			var td = self.div.find('[class^=td]');
			var span = self.div.find('span');
			var input = self.div.find('input');
			$(span[0]).text(_L('NAME1'));
			if (!self.editable) return;
			$(td[0]).click(function() {
				var txt = $('<input>', { type:'text', value:self.data.req });
				txt.css({
					width:$(this).width(),
					height:$(this).height(),
				});
				$(this).empty().append(txt);
				txt.on('blur', function(){
					$(this).remove();
					try {
						self.data.req = parseInt($(this).val());
						self.data.req = isNaN(self.data.req) ? 0 : self.data.req;
					} catch (e) {
						self.data.req = 0;
					}
					self.draw();
				}).focus().select();
			});
			$(td[2]).click(function() {
				var selected = [];
				var auth = UI.popup(400,430);
				self.div.append(auth);
				for ( var i in self.data.auth ) {
					selected.push(i);
				}
				var sel = new SelPerson(auth, function(ok, sp) {
					if (ok===true) {
						Util.name(sp).then(function(res) {
							self.data.auth = res;
							self.draw();
						}).catch(function(e) {
							self.err = e.message;
							self.draw();
						});
					}
					UI.closePopup();
				}, selected);
			});
			$(input[0]).blur(function() {
				self.data.name = $(this).val();
			});
			self.draw();
		});
	},

	draw : function() {
		var td = this.div.find('[class^=td]');
		var input = this.div.find('input');
		$(td[0]).empty().append($('<div>', {text:(this.data.req===0 ? _L('ALL_MEMBER') : this.data.req )}));
		td = $(td[2]).empty();
		$(input[0]).val(this.data.name);
		var self = this;
		var auth = {
			true : {},
			false : {class: this.data.class}
		}[this.data.class===undefined];
		for ( var i in this.data.auth) {
			auth.text = this.data.auth[i];
			td.append($('<div>', auth));
		}
		if (td.children().length===0) {
			auth.text = _L('ALL_MEMBER');
			td.append($('<div>', auth));
		}
	},

	get : function() {
		var input = this.div.find('input');
		var ret = {
			groupid : this.data.groupid,
			id : this.data.id,
			name : $(input[0]).val(),
			req : this.data.req,
			auth : []
		};
		for ( var i in this.data.auth ) {
			ret.auth.push(i);
		}
		return ret;
	}
};