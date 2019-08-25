/**
 * git pull
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	result.remotes = {};
	// console.log(lines);
	var currentRemoteUrl;

	lines.forEach(function(line){

		// --------------------------------------
		// Current Remote URL
		if( line.match(/^From ([^\s]+)$/) ){
			currentRemoteUrl =RegExp.$1;
			if(!result.remotes[currentRemoteUrl]){
				result.remotes[currentRemoteUrl] = [];
			}
			return;
		}

		// --------------------------------------
		// Pull new branch
		if( line.match(/^ \* \[new branch\]\s+([^\s]+)\s+\-\>\s+([^\s]+)$/) ){
			result.remotes[currentRemoteUrl].push({
				affect: 'added',
				branchName: RegExp.$1,
				remoteBranchNameFrom: RegExp.$2
			});
			return;
		}

		// // --------------------------------------
		// // Pull branch
		// if( line.match(/^   ([^\s]+)\.\.([^\s]+)\s+([^\s]+)\s+\-\>\s+([^\s]+)$/) ){
		// 	result.remotes[currentRemoteUrl].push({
		// 		affect: 'updated',
		// 		commitFrom: RegExp.$1,
		// 		commit: RegExp.$2,
		// 		branchName: RegExp.$3,
		// 		remoteBranchNameFrom: RegExp.$4
		// 	});
		// 	return;
		// }

	});

	// console.log(result);
	callback(result);
}
