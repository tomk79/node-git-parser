/**
 * git status
 */
module.exports = function(result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	result.untrackedFiles = [];

	lines.forEach(function(line){

		if( !phase ){
			if( line.match(/^On\ branch\ ([\s\S]*)$/g) ){
				result.currentBranchName = RegExp.$1;
			}

		}

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
			if( line.match(/^\t([\s\S]*)$/g) ){
				result.untrackedFiles.push( RegExp.$1 );
				return;
			}
		}
	});

	// console.log(result);
	callback(result);
}
