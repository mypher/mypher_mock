_ = {
	prepare : function() {
		var cb = function(type) {
			if (type===NOTIFY.CREATE) {
				alert('create');
			} else {
				var data = [
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
				];
				list.show(data);
			}
		};
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
			type : MODE.NEW,
			col : col,
			key : 'key1'
		}
		var list = new List(type, cb);
	},
	prepare2 : function() {
		var gid = '1234567890123456789012345678901234567890123456789012345678901234';
		var list = new TokenList($('#list'), MODE.NEW, gid, function(evt, sel) {
			alert(evt);
		});
	},
	prepare3 : function() {
		var gid = '1234567890123456789012345678901234567890123456789012345678901234';
		var list = new TaskList($('#list'), MODE.NEW, gid, function(evt, sel) {
			alert(evt);
		});
	}
};

$(function(){
	_.prepare3();
});
