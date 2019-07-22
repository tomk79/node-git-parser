/**
 * git status
 */
module.exports = function(result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	result.untrackedFiles = [];
	result.newFiles = [];
	result.modifiedFiles = [];
	result.deletedFiles = [];
	// console.log(lines);

	lines.forEach(function(line){

		// --------------------------------------
		// Branch Name
		if( !phase ){
			if( line.match(/^On\ branch\ ([\s\S]*)$/g) ){
				result.currentBranchName = RegExp.$1;
			}
		}

		// --------------------------------------
		// Untracked files
		if( line == 'Untracked files:' ){
			phase = 'untracked_files_standby';
			return;
		}else if(phase == 'untracked_files_standby'){
			if( !line.length ){
				phase = 'untracked_files';
				return;
			}
		}else if(phase == 'untracked_files'){
			if( !line.length ){
				phase = null;
				return;
			}
			if( line.match(/^[\s]*([\s\S]*?)$/g) ){
				result.untrackedFiles.push( RegExp.$1 );
				return;
			}
		}

		// --------------------------------------
		// Staged
		if( line == 'Changes to be committed:' ){
			phase = 'changes_to_be_committed_standby';
			return;
		}else if(phase == 'changes_to_be_committed_standby'){
			if( !line.length ){
				phase = 'changes_to_be_committed';
				return;
			}
		}else if(phase == 'changes_to_be_committed'){
			if( !line.length ){
				phase = null;
				return;
			}
			if( line.match(/^[\s]*new\ file\:[\s]+([\s\S]*?)$/g) ){
				result.newFiles.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\s]*modified\:[\s]+([\s\S]*?)$/g) ){
				result.modifiedFiles.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\s]*deleted\:[\s]+([\s\S]*?)$/g) ){
				result.deletedFiles.push( RegExp.$1 );
				return;
			}
		}
	});

	// console.log(result);
	callback(result);
}
