_ = {
	prepare : function() {
		var col = [
			{
				width : 3,
				label :  'テスト',
				name : 'test1'
			},
			{
				width : 4,
				label :  'テスト2',
				name : 'test2'
			},
			{
				width : 5,
				label :  'テストああああああああああああああ',
				name : 'testi3'
			}
		];
		var type = {
			div : $('#list'),
			col : col,
			key : 'key1',
			label : 'test1',
			type : SEL_TYPE_MULTIPLE
		};
		var list = new SelList(type, function(evt, sel) {
			if (evt===SEL_EVENT_FILTER) {
				list.show([
					{
						key1 : 'key1',
						test1 : 'aaabdsbsbaaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key2',
						test1 : 'aabdsbdsaaaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key3',
						test1 : 'aaabsdbsdaaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key4',
						test1 : 'aaaerheraaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key5',
						test1 : 'aaaasdbsbdsaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key6',
						test1 : 'aaaehreraaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key7',
						test1 : 'asfbfbaaaaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key8',
						test1 : 'aaaandgndaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key9',
						test1 : 'aaagwrgaaa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					},
					{
						key1 : 'key10',
						test1 : 'aaaa52352aa',
						test2 : 'bbbbbbbb',
						testi3 : 'ああああああああ'
					}
				]);
			}
		});
	},
	prepare2 : function() {
		var list = new PersonSelList($('#list'), SEL_TYPE_MULTIPLE);
	},
	prepare3 : function() {
		var cb = function() {
		}
		var list = new TaskSelList($('#list'), SEL_TYPE_MULTIPLE, '1234567890123456789012345678901234567890123456789012345678901234', cb);
	},
	prepare4 : function() {
		var cb = function(type, vals) {
			alert(1);
		}
		var list = new TokenSelList($('#list'), SEL_TYPE_MULTIPLE, '1234567890123456789012345678901234567890123456789012345678901234', cb);
	}
};

$(function(){
	_.prepare4();
});
