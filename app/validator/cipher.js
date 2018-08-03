// this module is referred by both server and client.

module.exports = {
	/** 
	 * isEditableVer
	 * params : cipher
	 */
	isEditableVer : function(cipher) {
		// if a draft is formalized yet, it is editable
		if (!cipher.formalver) {
			return {};
		}
		// only the case which version is bigger than latest formal version, a draft is editable
		if (cipher.formalver >= cipher.ver) {
			return {code:'NOT_EDITABLE'};
		}
		return {};
	},

	/**
	 * canUseForSource
	 * params cipher
	 */
	canUseForSource : function(cipher) {
		// a draft whose version is bigger than latest formal version can be used for source.
		if (cipher.ver>cipher.formalver) {
			return {};
		}
		// latest formal version can be used for source.
		if (cipher.ver===cipher.formalver && cipher.draftno===cipher.formaldraft) {
			return {};
		}
		return {code:'CANT_USE_FOR_SOURCE'};
	},

	/**
	 * isEditor
	 * params : person, cipher
	 */
	isEditor : function(person, cipher) {
		var member = Validator.cmn.split(cipher.editor);
		var p = Validator.cmn.pickMembers(person, member);
		return (p.length===1) ? {} : {code:'NOT_HAVE_UPDATE_AUTH'};
	},

	/**
	 * isEditable
	 * params : cipher, person
	 */
	isEditable : function(cipher, person) {
		// check if cipher is editable
		var ret = Validator.cipher.isEditableVer(cipher);
		if (ret.code) {
			return ret;
		}
		// check if person is editor
		ret = Validator.cipher.isEditor(person, cipher);
		if (ret.code) {
			return ret;
		}
		return {};
	},

	/**
	 * canApprove
	 * params cipher, person
	 */
	canApprove : function(cipher, person) {
		// only editable draft can be approved
		let ret = Validator.cipher.isEditableVer(cipher);
		if (ret.code) {
			return ret;
		}
		// check if person is approver
		if (!Validator.cmn.isMember(person, cipher.drule_auth)) {
			return {code:'NOT_HAVE_APPROVE_AUTH'};
		}
		// check if person already approved
		if (Validator.cmn.isMember(person, cipher.approved)) {
			return {code:'ALREADY_APPROVED'};
		}
		return {};
	},

	/**
	 * canCancelApprovement
	 * cipher, person
	 */
	canCancelApprovement : function(cipher,person) {
		// only editable draft can be canceled
		let ret = Validator.cipher.isEditableVer(cipher);
		if (ret.code) {
			return ret;
		}
		// check if person is approver
		if (!Validator.cmn.isMember(person, cipher.drule_auth)) {
			return {code:'NOT_HAVE_APPROVE_AUTH'};
		}
		// check if person approved
		if (!Validator.cmn.isMember(person, cipher.approved)) {
			return {code:'NOT_APPROVE_YET'};
		}
		return {};
	}
};

var Validator = Validator||{};
Validator.cipher = module.exports;
if (typeof(require)!=='undefined') {
	Validator.cmn = require('./cmn');
}
