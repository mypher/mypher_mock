// this module is referred by both server and client.

module.exports = {
	/**
	 * isEditable
	 * params : cipher, token, person
	 */
	isEditable : function(cipher, token, person) {
		var ret = null;
		// only a person who has editing authorization can edit
		ret = Validator.cipher.isEditor(person, cipher);
		if (ret.code) {
			return ret;
		} 
		// if there is difference between cipher and task, return false
		if (!Validator.token.isBelong(cipher, token)) {
			return false;
		}
		// if cipher to which task belongs is not editable, task is uneditable
		ret = Validator.cipher.isEditableVer(cipher);
		if (ret.code) {
			return ret;
		}
		return true;
	},	
	/**
	 * isBelong
	 * params : cipher, token 
	 */
	isBelong : function(cipher, token) {
		return ((cipher.id===token.groupid) && (cipher.ver===token.ver) && (cipher.draftno===token.draftno))
		? {} : {code:'THERE_IS_INCONSISTENT'}; 
	}
};

var Validator = Validator||{};
Validator.token = module.exports;
if (typeof(require)!=='undefined') {
	Validator.cmn = require('./cmn');
	Validator.cipher = require('./cipher');
}