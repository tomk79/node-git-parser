/**
 * git branch
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	result.branches = [];

	lines.forEach(function(line){
		if( !line.length ){
			return;
		}

		if( line.match(/^(\*?)[\s]*([\S]*)$/g) ){
			var branchName = RegExp.$2;
			result.branches.push(branchName);
			if( RegExp.$1 ){
				result.currentBranchName = branchName;
			}
		}

	});

	callback(result);
}
