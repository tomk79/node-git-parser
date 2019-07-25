/**
 * git checkout
 */
module.exports = function(result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	result.result = false;
	result.created = false;

	lines.forEach(function(line){
		if( !line.length ){
			return;
		}

		if( line.match(/^Switched\ to\ (a\ new\ )?branch \'([\S]*?)\'$/g) ){
			var branchName = RegExp.$2;
			result.currentBranchName = branchName;
			if( RegExp.$1 ){
				result.created = true;
			}
			result.result = true;
		}

	});

	callback(result);
}
