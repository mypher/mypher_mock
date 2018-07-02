'use_strict'

module.exports = {
	expCsvInc : v => {
		// sanitize
		v = v.replace(/(\\|\*|\+|\.|\?|\{|\(|\[|\^|\$|\-|\||\/)/g, '¥¥$1');
		return '(^#,|^#$|,#,|,#$)'.replace(/#/g, v);
	},

	sanitizeForLike : v => {
		return v ? v.replace(/(%|_))/g, '¥¥$1') : '';
	}
};


