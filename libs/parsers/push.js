/**
 * git push
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
		if( line.match(/^(?:remote\:[\s]*)?To ([^\s]+)$/) ){
			currentRemoteUrl =RegExp.$1;
			if(!result.remotes[currentRemoteUrl]){
				result.remotes[currentRemoteUrl] = [];
			}
			return;
		}

		// --------------------------------------
		// Push new branch
		if( line.match(/^ \* \[new branch\]\s+([^\s]+)\s+\-\>\s+([^\s]+)$/) ){
			result.remotes[currentRemoteUrl].push({
				affect: 'added',
				branchNameFrom: RegExp.$1,
				remoteBranchName: RegExp.$2
			});
			return;
		}

		// --------------------------------------
		// Push branch
		if( line.match(/^   ([^\s]+)\.\.([^\s]+)\s+([^\s]+)\s+\-\>\s+([^\s]+)$/) ){
			result.remotes[currentRemoteUrl].push({
				affect: 'updated',
				commitFrom: RegExp.$1,
				commit: RegExp.$2,
				branchNameFrom: RegExp.$3,
				remoteBranchName: RegExp.$4
			});
			return;
		}

		// --------------------------------------
		// Delete remote branch
		if( line.match(/^ \- \[deleted\]\s+([^\s]+)$/) ){
			result.remotes[currentRemoteUrl].push({
				affect: 'deleted',
				remoteBranchName: RegExp.$1
			});
			return;
		}

	});

	// console.log(result);
	callback(result);
}
