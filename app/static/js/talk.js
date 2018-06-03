
function Talk(div, grp) {
	this.init(div, grp);
}

Talk.prototype = {
	init : function(div, grp) {
		this.div = div;
		this.grp = grp;
		this.getData();
	},

	getData : function() {
		this.data = [];
		var self = this;
		Rpc.call('talk.getGroup', [this.grp], function(res) {
			self.sort(res.result);
			self.refresh();
		}, function(err) {
			self.err = err.message;
		}, function(fail) {
			self.err = err.message;
		});
	},

	sort : function(data) {
		var elms = {};
		var top = {
			key : null,
			tm : 99999999999999
		};
		for (var i=0; i<data.rel.length; i++) {
			var elm = data.rel[i];
			try {
				elm.tm = parseInt(elm.tm);
			} catch (e) {
				// TODO:call alert object
				alert(e);
				continue;
			}
			if (elm.tm<top.tm) {
				top = {
					key : elm.current,
					tm : elm.tm
				};
			}
			// check if elm.current is first element of the group
			if (elm.refer === null) {
				top = {
					key : elm.current,
					tm : 0
				}
			} else {
				if (elms[elm.refer]) {
					elms[elm.refer].child.push(elm.current);
				} else {
					elms[elm.refer] = {
						sel : 0,
						child : [elm.current]
					}
				}
			}
		}
		this.top = top.key;
		this.rel = elms;

		this.dtl = {};
		for ( var i in data.dtl ) {
			this.dtl[data.dtl[i].key] = data.dtl[i];
		}
	},

	showWriteForm: function(ref) {
		var self = this;
		var back = UI.createDiv('tback', 'tback');
		var popup_o = UI.createDiv('tpopup_outer', 'tpopup');
		var popup_i = UI.createDiv('tpopup_inner');
		var box = document.createElement('textarea'); 
		var post = UI.createBtn('', 'POST', 'tpost');
		var cancel = UI.createBtn('', 'CANCEL', 'tcancel');
		box.className = 'ttext';
		popup_o.appendChild(popup_i);
		popup_i.appendChild(box);
		UI.append(document.body, [back, popup_o]);
		UI.append(popup_i, [box, post, cancel]);
		$(cancel).click(function() {
			self.hideWriteForm();
		})
		$(post).click(function(){
			self.post(ref, box.value);
		});
	},

	hideWriteForm : function() {
		$('#tback').remove();
		$('#tpopup').remove();
	},

	post : function(ref, val) {
		var self = this;
		Rpc.call('talk.post', [this.grp, ref, 'personid', val], function(res) {
			self.refresh();
			self.hideWriteForm();
		}, function(err) {
			self.err = err.message;
		}, function(fail) {
			self.err = err.message;
		});
	},

	refresh : function() {
		var self = this;
		var prepareDtl = function(elm, id) {
			var person = UI.createDiv('tperson');
			var icon = UI.createDiv('ticon');
			var name = UI.createDiv('tname');
			var tm = UI.createDiv('ttime');
			var detail = UI.createDiv('tdetail');
			var btm = UI.createDiv('tbtm');
			var resbtn = UI.createDiv('tresbtn');
			var attentionbtn = UI.createDiv('tatnbtn');
			var dtl = self.dtl[id];
			name.innerHTML = dtl.personid;
			tm.innerHTML = Util.svTime2Local(dtl.tm);
			detail.innerHTML = Util.sanitize(dtl.data);
			resbtn.innerHTML = '<small>res</small>';
			attentionbtn.innerHTML = '<small>atn</small>';
			UI.append(person, [icon, name]);
			UI.append(btm, [resbtn, attentionbtn]);
			UI.append(elm, [person, tm, detail, btm]);
			$(resbtn).click(function(){
				self.showWriteForm(dtl.key);
			});
			$(attentionbtn).click(function() {
				alert(2);
			});
		};
		var prepareTab = function(elm, rel) {
			var tabset = UI.createDiv('ttabset');
			for ( var i=0; i<rel.child.length; i++) {
				var tab = UI.createDiv('ttabelm');
				tab.pid = self.dtl[rel.child[i]].personid;
				try {
					tab.innerHTML = tab.pid
				} catch (e) {
					alert(e);
				}
				tabset.appendChild(tab);
				$(tab).click(function() {
					alert(this.pid);
				});
			}
			elm.appendChild(tabset);
		};
		this.div.innerHTML = '';
		var cur = this.top;
		for ( var i=0; i<100; i++) {
			if (!cur) break;
			var elm = UI.createDiv('telm', cur);
			prepareDtl(elm, cur);
			this.div.append(elm);
			var rel = this.rel[cur];
			// TODO:Succeeding element
			if (!rel) break;
			if (rel.child.length>1) {
				prepareTab(this.div[0], rel);
			}
			cur = rel.child[rel.sel];
		};
	} 
};
