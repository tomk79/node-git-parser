/**
 * git log
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    result.logs = [];
    var tmpLog, files;
	// console.log(lines);

	var parsedCmd = this.parseCmdAry(cmdAry);
	// console.log(parsedCmd);

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
			return;

		}else if(phase == 'log_commit_message'){
			if( !line.length ){
				if( parsedCmd.options.p ){
					phase = 'log_commit_files';
					files = [];
					return;
				}
				phase = null;
                result.logs.push(tmpLog);
                tmpLog = {};
				return;
			}
			if( line.match(/^\s{4}([\s\S]*?)$/g) ){
				tmpLog.message += RegExp.$1 + "\n";
				return;
			}
		}else if(phase == 'log_commit_files'){
			if( !line.length ){
				phase = null;
				tmpLog.files = parseLogFiles(files);
                result.logs.push(tmpLog);
                tmpLog = {};
				return;
			}
			files.push(line);
			return;
		}

	});

	// console.log(result);
	callback(result);
}

/**
 * ファイルのdiff部分を解析
 */
function parseLogFiles(lines){
	var rtn = [];
	lines.forEach(function(line){
		rtn.push(line);
	});
	return rtn;
}
