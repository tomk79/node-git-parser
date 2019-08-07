/**
 * git log
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    result.logs = [];
    var tmpLines=[], tmpLog;
	// console.log(lines);

	var parsedCmd = this.parseCmdAry(cmdAry);
	// console.log(parsedCmd);

	if( parsedCmd.options.pretty ){
		// TODO: 未対応
	}else if( parsedCmd.options.stat ){
		// TODO: 未対応
	}else{
		lines.forEach(function(line){

			if( line.match(/^commit\ ([0-9a-fA-F]+)$/) ){
				tmpLog = {};
				tmpLog.commit = RegExp.$1;
				tmpLog.message = '';
				tmpLines=[];
				phase = 'log_header';
				return;

			}else if(phase == 'log_header'){
				if( !line.length ){
					phase = 'log_commit_message';
					tmpLog = parseLogHeaders(tmpLog, tmpLines);
					tmpLines = [];
					return;
				}
				tmpLines.push(line);
				return;

			}else if(phase == 'log_commit_message'){
				if( !line.length ){
					if( parsedCmd.options.p ){
						phase = 'log_commit_files';
						tmpLines = [];
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
				return;

			}else if(phase == 'log_commit_files'){
				if( !line.length ){
					phase = null;
					tmpLog.files = parseLogFiles(tmpLines);
					result.logs.push(tmpLog);
					tmpLog = {};
					return;
				}
				tmpLines.push(line);
				return;

			}
		});
	}

	// console.log(result);
	callback(result);
}

/**
 * header部分を解析
 */
function parseLogHeaders(tmpLog, lines){
	lines.forEach(function(line){
		if( line.match(/^Author\:\s+([\s\S]+?)\s+\<([\S]+?)\>$/g) ){
			tmpLog.author = RegExp.$1;
			tmpLog.email = RegExp.$2;
			return;
		}
		if( line.match(/^Date\:\s+([\s\S]+?)$/g) ){
			tmpLog.date = RegExp.$1;
			return;
		}
	});
	return tmpLog;
}

/**
 * ファイルのdiff部分を解析
 */
function parseLogFiles(lines){
	var phase = null;
	var rtn = [];
	var tmpFileDiff = {};
	lines.forEach(function(line){
		if( line.match(/^diff\ \-\-git\ a\/([\s\S]*?) b\/([\s\S]*?)$/) ){
			if( tmpFileDiff.filename ){
				rtn.push(tmpFileDiff);
				tmpFileDiff = {};
			}
			tmpFileDiff.filenameBefore = RegExp.$1;
			tmpFileDiff.filename = RegExp.$2;
			// tmpFileDiff.diff = [];
			phase = 'diff_header';
			return;

		}else if(phase == 'diff_header'){
			// if( line.match(/^Author\:\s+([\s\S]+?)\s+\<([\S]+?)\>$/g) ){
			// 	tmpLog.author = RegExp.$1;
			// 	tmpLog.email = RegExp.$2;
			// 	return;
			// }
			// if( line.match(/^Date\:\s+([\s\S]+?)$/g) ){
			// 	tmpLog.date = RegExp.$1;
			// 	return;
			// }
			// tmpFileDiff.diff.push(line);
		}
	});
	if( tmpFileDiff.filename ){
		rtn.push(tmpFileDiff);
		tmpFileDiff = {};
	}
	return rtn;
}
