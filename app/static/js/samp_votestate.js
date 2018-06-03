_ = {
	prepare : function() {
		var data1 = {
			n : {
				list : [ 'test2', 'test3', 'test5','test6', 'test7', 'test8','test9','test10'],
				class : 'tagclr'
			},
			d : { 
				req:1,
				opt:['test2', 'test3', 'test5', 'test8'],
				class : 'tagclr'
			}
		};
		var data2 = {
			n : {
				list : [ 'test2', 'test3', 'test5','test6', 'test7', 'test8','test9','test10'],
				class : 'tagclr'
			},
			d : { 
				list : [ 'test2', 'test3', 'test5','test6', 'test7', 'test8','test9','test10'],
				class : 'tagclr'
			}
		};
		_.vote1 = new VoteState($('#votestate1'), data1);
		_.vote2 = new VoteState($('#votestate2'), data2);
	}
};

$(function(){
	_.prepare();
});