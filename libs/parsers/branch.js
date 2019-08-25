/**
 * git branch
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	result.branches = [];

	var parsedCmd = this.parseCmdAry(cmdAry);

	if( parsedCmd.options.delete || parsedCmd.options.D ){
		result.result = false;
		// console.log(lines);
		lines.forEach(function(line){
			if( !line.length ){
				return;
			}

			if( line.match(/^Deleted branch ([^\s]+) \(was ([^\s]+)\)\.$/) ){
				result.result = true;
				result.branchName = RegExp.$1;
				result.lastCommit = RegExp.$2;
				return;
			}

		});

	}else{
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
	}

	callback(result);
}
