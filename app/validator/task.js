// this module is referred by both server and client.

module.exports = {

	/**
	 * isEditable
	 * params : cipher, task, person
	 */
	isEditable : function(cipher, task, person) {
		var ret = null;
		// only a person who has editing authorization can edit
		ret = Validator.cipher.isEditor(person, cipher);
		if (ret.code) {
			return ret;
		} 
		// if there is difference between cipher and task, return false
		if (!Validator.task.isBelong(cipher, task)) {
			return false;
		}
		// if cipher to which task belongs is not editable, task is uneditable
		ret = Validator.cipher.isEditableVer(cipher);
		if (ret.code) {
			return ret;
		}
		// if PIC is already approved, task is uneditable
		if (Validator.task.isPicApproved(task)) {
			return false;
		}
		return true;
	},

	/**
	 * isPicApproved
	 * params : task.req, task.auth, task.pic_approve
	 */
	isPicApproved : function(task) {
		var approved = Validator.cmn.split(task.pic_approve);
		var auth = Validator.cmn.split(task.auth);
		return Validator.cmn.isFulfill(task.req, approved, auth);
	},

	/**
	 * isResultsApproved
	 * params : task
	 */
	isResultsApproved : function(task) {
		var review = Validator.cmn.split(task.review);
		var auth = Validator.cmn.split(task.auth);
		return Validator.cmn.isFulfill(task.req, review, auth);
	},
	/**
	 * isBelong
	 * params : cipher, task 
	 */
	isBelong : function(cipher, task) {
		return ((cipher.id===task.groupid) && (cipher.ver===task.ver) && (cipher.draftno===task.draftno))
		? {} : {code:'THERE_IS_INCONSISTENT'}; 
	},

	/**
	 * canApplyToPic
	 * params : task, user
	 */
	canApplyToPic : function(task, user) {
		if (Validator.cmn.isEmpty(user)) return {code:'USER_NOT_LOGIN'};
		return (Validator.cmn.isEmpty(task.pic)) ? {} : {code:'ALREADY_APPLIED'};
	},

	/**
	 * canCancelPic
	 * params : user, task
	 */
	canCancelPic : function(task, user) {
		// if results is already approved, pic can't cancel
		if (Validator.task.isResultsApproved(task)) {
			return {code:'TASK_ALREADY_COMPLETED'};
		}
		return (task.pic===user) ? {} : {code:'NOT_SET_TO_PIC'};
	},

	/**
	 * canApprovePic
	 * params : cipher, task, person
	 */
	canApprovePic : function(cipher, task, person) {
		var ret = null;
		// check if person can update
		if (!Validator.cmn.isMember(person, task.auth)) {
			return {code:'NOT_HAVE_APPROVE_AUTH'};
		}
		// if there is difference between cipher and task, return error
		ret = Validator.task.isBelong(cipher, task); 
		if (ret.code) {
			return ret;
		}
		// if pic is already approved, it is unnecessary to approve
		if (Validator.task.isPicApproved(task)) {
			return {code:'ALREADY_Fulfill_REQ'};
		}
		// if pic is not set, it is impossible to approve
		if (!task.pic||task.pic==='') {
			return {code:'PIC_NOT_SET'};
		}
		// if cipher doesn't become formal once before, it is impossible to approve
		if (!cipher.formalver) {
			return {code:'CIPHER_NOT_FORMAL_YET'};
		}
		// if person already approve pic, it is unnecessary to approve
		if (Validator.cmn.isMember(person, task.pic_approve)) {
			return {code:'ALREADY_APPLIED'};
		}
		return {};
	},

	/**
	 * canCancelApprovementPic
	 * params : cipher, task, person
	 */
	canCancelApprovementPic : function(cipher, task, person) {
		var ret = null;
		// check if person can update
		if (!Validator.cmn.isMember(person, task.auth)) {
			return {code:'NOT_HAVE_APPROVE_AUTH'};
		}
		// if there is difference between cipher and task, return error
		ret = Validator.task.isBelong(cipher, task); 
		if (ret.code) {
			return ret;
		}
		// if person doesn't approve yet, it is unnecessary to cancel
		if (Validator.cmn.isMember(person, task.pic_approve)) {
			return {code:'NOT_APPROVE_YET'};
		}
		// if results are already approved, it is impossible to cancel
		if (Validator.task.isResultsApproved(task)) {
			return {code:'TASK_ALREADY_COMPLETED'};
		}
		return {};
	},

	/**
	 * canApproveResults
	 * params : cipher, task, person
	 */
	canApproveResults : function(cipher, task, person) {
		var ret = null;
		// if there is difference between cipher and task, return error
		ret = Validator.task.isBelong(cipher, task); 
		if (ret.code) {
			return ret;
		}
		// check if person can update
		if (!Validator.cmn.isMember(person, task.auth)) {
			return {code:'NOT_HAVE_APPROVE_AUTH'};
		}
		// if pic is not approved, results can't be approved
		if (!Validator.task.isPicApproved(task)) {
			return {code:'PIC_NOT_APPROVED'};
		}
		// if results are already approved, it is unnecessary to approve
		if (Validator.task.isResultsApproved(task)) {
			return {code:'ALREADY_Fulfill_REQ'};
		}
		// if cipher doesn't become formal once before, it is impossible to approve
		if (!cipher.formalver) {
			return {code:'CIPHER_NOT_FORMAL_YET'};
		}
		// if person already approved, it is unnecessary to approve
		if (Validator.cmn.isMember(person, task.review)) {
			return {code:'ALREADY_APPROVED'};
		}
		return {};
	}, 
	/**
	 * canCancelApprovementResults
	 * params : cipher, task, person
	 */
	canCancelApprovementResults : function(cipher, task, person) {
		var ret = null;
		// check if person can update
		if (!Validator.cmn.isMember(person, task.auth)) {
			return {code:'NOT_HAVE_APPROVE_AUTH'};
		}
		// if there is difference between cipher and task, return error
		ret = Validator.task.isBelong(cipher, task); 
		if (ret.code) {
			return ret;
		}
		// if person not approved, it is unnecessary to cancel
		if (!Validator.cmn.isMember(person, task.review)) {
			return {code:'NOT_APPROVE_YET'};
		}
		return {};
	}
};

var Validator = Validator||{};
Validator.task = module.exports;
if (typeof(require)!=='undefined') {
	Validator.cmn = require('./cmn');
	Validator.cipher = require('./cipher');
}
