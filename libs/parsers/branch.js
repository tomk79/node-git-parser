/**
 * git branch
 * 
 * 【対応できているオプション】
 * 
 * - ブランチを削除する: `--delete`, `-d`, `-D`
 * - リモートブランチをリストする: `--remote`, `-r`
 * - ローカルとリモートの両方のブランチをリストする: `--all`, `-a`
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	result.branches = [];

	var parsedCmd = this.parseCmdAry(cmdAry);

	if( parsedCmd.options.delete || parsedCmd.options.d || parsedCmd.options.D ){
		// --------------------
		// ブランチを削除する

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
		// --------------------
		// ブランチリストを取得する
		var isLocal = true;
		var isRemote = false;

		if( parsedCmd.options.remote || parsedCmd.options.r ){
			isLocal = false;
			isRemote = true;
		}
		if( parsedCmd.options.all || parsedCmd.options.a ){
			isLocal = true;
			isRemote = true;
		}

		if(isLocal){
			result.localBranches = [];
		}
		if(isRemote){
			result.remoteBranches = [];
		}

		lines.forEach(function(line){
			if( !line.length ){
				return;
			}

			if( line.match(/^(\*?)[\s]*([\S]*)$/g) ){
				var branchName = RegExp.$2;

				if( !isLocal && isRemote ){
					branchName = 'remotes/' + branchName;
				}

				result.branches.push(branchName);
				if( RegExp.$1 ){
					result.currentBranchName = branchName;
				}

				var remoteBranchName = null;
				if( isRemote && branchName.match(/^remotes\//) ){
					remoteBranchName = branchName.replace(/^remotes\//, '');
				}
				if( isLocal && remoteBranchName === null){
					result.localBranches.push(branchName);
				}
				if( isRemote && remoteBranchName !== null){
					result.remoteBranches.push(remoteBranchName);
				}
			}

		});

	}

	callback(result);
}
