/**
 * git status
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	result.staged = {};
	result.staged.untracked = [];
	result.staged.modified = [];
	result.staged.deleted = [];
	result.notStaged = {};
	result.notStaged.untracked = [];
	result.notStaged.modified = [];
	result.notStaged.deleted = [];
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
		// Phase switch
		if( line == 'Untracked files:' ){
			phase = 'untracked_files';
			return;
		}else if( line == 'Changes not staged for commit:' ){
			phase = 'changes_not_staged_for_commit';
			return;
		}else if( line == 'Changes to be committed:' ){
			phase = 'changes_to_be_committed';
		}

		if(phase == 'untracked_files'){
			if( line.match(/^[\t]([\s\S]*?)$/g) ){
				result.notStaged.untracked.push( RegExp.$1 );
			}
		}else if(phase == 'changes_not_staged_for_commit'){
			if( line.match(/^[\t]modified\:[\s]+([\s\S]*?)$/g) ){
				result.notStaged.modified.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\t]deleted\:[\s]+([\s\S]*?)$/g) ){
				result.notStaged.deleted.push( RegExp.$1 );
				return;
			}
		}else if(phase == 'changes_to_be_committed'){
			if( line.match(/^[\t]new\ file\:[\s]+([\s\S]*?)$/g) ){
				result.staged.untracked.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\t]modified\:[\s]+([\s\S]*?)$/g) ){
				result.staged.modified.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\t]deleted\:[\s]+([\s\S]*?)$/g) ){
				result.staged.deleted.push( RegExp.$1 );
				return;
			}
		}
	});

	// console.log(result);
	callback(result);
}
