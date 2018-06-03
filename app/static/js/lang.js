var $L = {
	'jp' : {
		'RULE' : 'ルール',
		'EXCHANGE' : '交換',
		'DIVIDEND' : '分配',
		'TYPE' : 'タイプ',
		'TRIGGER_OF_EVENT' : 'イベント発生タイミング',
		'BY_REQUEST_OF_OWNER' : '所有者の依頼によって',
		'NONE' : 'なし',
		'BY_COMPLETION_OF_TASK'　: 'タスクの完了によって',
		'BY_NUMBER_OF_OWNED' : 'CIPHERの所有トークン数が一定数を超えることによって',
		'TASK_ID' : 'タスクID',
		'TOKEN_ID' : 'トークンID',
		'MINIMUM_TOKEN' : '必要トークン数',
		'TRANSFERED_CONTENT' : '分配・配布内容',
		'TARGET_CONTENT' : '対象物',
		'QUANTITY' : '量', 
		'QRCODE' : 'QRコード',
		'TOKEN' : 'トークン',
		'CRYPTOCURRENCY' : '暗号通貨',
		'TRANSFER' : '送金', 
		'SPECIFIED_NUMBER' : '指定数',
		'ISSUED_PER_SPECIFIED' : '発行数／指定数',
		'ID' : 'ID',
		'NAME1' : '名称',
		'DESC' : '概要',
		'REWARD' : '報酬',
		'PIC' : '担当者',
		'TASK_GROUP' : 'タスクグループ',
		'APPROVED' : '承認済',
		'RECENT' : '最新', 
		'APPROVE' : '承認',
		'PIC_APPROVE_STATE' : '担当者の承認状況',
		'REVIEW_STATE' : 'レビュー状況',
		'ALL_MEMBER' : '全員',
		'NOONE' : '対象なし',
		
		'@' : ''
	}
};

var __r = [
	/#0#/mg, /#1#/mg, /#2#/mg, /#3#/mg, /#4#/mg,
	/#5#/mg, /#6#/mg, /#7#/mg, /#8#/mg, /#9#/mg
];

function _L(id, prm) {
	var w = $L['jp'][id]||'';
	prm = prm||[];
	for ( var i=0; i<prm.length; i++) {
		w = w.replace(__r[i], prm[i]);
	}
	return w;
}