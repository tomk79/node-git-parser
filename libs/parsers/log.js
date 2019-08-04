/**
 * git log
 */
module.exports = function(result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    result.logs = [];
    var tmpLog;
	// console.log(lines);

	lines.forEach(function(line){

		// --------------------------------------
		// Untracked files
		if( line.match(/^commit\ ([0-9a-fA-F]+)$/) ){
            tmpLog = {};
            tmpLog.commit = RegExp.$1;
			phase = 'log_header';
			return;
		}else if(phase == 'log_header'){
			if( !line.length ){
    			phase = 'log_commit_message';
                tmpLog.message = '';
				return;
			}
			if( line.match(/^Author\:\s+([\s\S]+?)\s+\<([\S]+?)\>$/g) ){
				tmpLog.author = RegExp.$1;
				tmpLog.email = RegExp.$2;
				return;
			}
		}else if(phase == 'log_commit_message'){
			if( !line.length ){
				phase = null;
                result.logs.push(tmpLog);
                tmpLog = {};
				return;
			}
			if( line.match(/^\s{4}([\s\S]*?)$/g) ){
				tmpLog.message += RegExp.$1 + "\n";
				return;
			}
		}

	});

	// console.log(result);
	callback(result);
}
