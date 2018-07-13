// this module is referred by both server and client.

module.exports = {
	/** 
	 * isEditableVer
	 * params : cipher
	 */
	isEditableVer : function(cipher) {
		// only the case which version is bigger than latest formal version, draft is editable
		if (!cipher.formalver || cipher.formalver >= cipher.ver) {
			return {code:'NOT_EDITABLE'};
		}
		return {};
	},

	/**
	 * isEditor
	 * params : person, cipher
	 */
	isEditor : function(person, cipher) {
		var member = Varidator.cmn.split(cipher.editor);
		var p = Varidator.cmn.pickMembers(person, member);
		return (p.length===1) ? {} : {code:'NOT_HAVE_UPDATE_AUTH'};
	}
};

var Validator = Validator||{};
Validator.cipher = module.exports;
Validator.cmn = require ? require('./cmn') : Validator.cmn;