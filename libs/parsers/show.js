/**
 * git show
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    var tmpLines=[], tmpLog;

	var parsedCmd = this.parseCmdAry(cmdAry);

	if( parsedCmd.options.pretty || parsedCmd.options.format ){
		// TODO: 未対応
	}else if( parsedCmd.options.oneline ){
		// TODO: 未対応
	}else if( parsedCmd.options['show-notes'] || parsedCmd.options['no-standard-notes'] || parsedCmd.options['standard-notes'] ){
		// TODO: 未対応
	}else if( parsedCmd.options['show-signature'] ){
		// TODO: 未対応
	}else{
		lines.forEach(function(line){

			if( line.match(/^commit\ ([0-9a-fA-F]+)$/) ){
				tmpLog = {};
				result.commit = RegExp.$1;
				result.message = '';
				tmpLines=[];
				phase = 'log_header';
				return;

			}else if(phase == 'log_header'){
				if( !line.length ){
					phase = 'log_commit_message';
					result = parseLogHeaders(result, tmpLines);
					tmpLines = [];
					return;
				}
				tmpLines.push(line);
				return;

			}else if(phase == 'log_commit_message'){
				if( !line.length ){
					phase = 'log_commit_files';
					tmpLines = [];
					return;
				}
				if( line.match(/^\s{4}([\s\S]*?)$/g) ){
					result.message += RegExp.$1 + "\n";
					return;
				}
				return;

			}else if(phase == 'log_commit_files'){
				if( !line.length ){
					phase = null;
					if( parsedCmd.options['name-status'] ){
						result.files = parseLogFilesNameStatus(tmpLines);
					}else{
						result.files = parseLogFiles(tmpLines);
					}
					return;
				}
				tmpLines.push(line);
				return;

			}
		});
	}

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

	tmpLog.timestamp = null;
	if( tmpLog.date ){
		// コミット日時情報をタイムスタンプ化 (ms)
		tmpLog.timestamp = Date.parse(tmpLog.date);
	}

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
			tmpFileDiff.type = 'changed';
			tmpFileDiff.isRenamed = (tmpFileDiff.filenameBefore !== tmpFileDiff.filename);
			tmpFileDiff.similarity = false;
			tmpFileDiff.index = {};
			// tmpFileDiff.diff = [];
			phase = 'diff_header';
			return;

		}else if(phase == 'diff_header'){
			if( line.match(/^new\ file\ mode\ ([0-9]+)$/g) ){
				tmpFileDiff.type = 'added';
				tmpFileDiff.mode = RegExp.$1;
				return;
			}
			if( line.match(/^deleted\ file\ mode\ ([0-9]+)$/g) ){
				tmpFileDiff.type = 'deleted';
				tmpFileDiff.mode = RegExp.$1;
				return;
			}
			if( line.match(/^similarity\ index\ ([1-9][0-9]*\%)$/g) ){
				tmpFileDiff.similarity = RegExp.$1;
				return;
			}
			if( line.match(/^index\ ([0-9a-zA-Z]+)\.\.([0-9a-zA-Z]+)(?:\ ([0-9]+))?$/g) ){
				tmpFileDiff.index.from = RegExp.$1;
				tmpFileDiff.index.to = RegExp.$2;
				if( RegExp.$3 ){
					tmpFileDiff.mode = RegExp.$3;
				}
				return;
			}
		}
	});
	if( tmpFileDiff.filename ){
		rtn.push(tmpFileDiff);
		tmpFileDiff = {};
	}
	return rtn;
}

/**
 * ファイルのdiff部分を解析 (`--name-status` オプションが有効な場合)
 */
function parseLogFilesNameStatus(lines){
	var rtn = [];

	lines.forEach(function(line){
		var tmpFileDiff = {};
		if( line.match(/^(M|A|D|C|T|U|X|B|UU)\t([\s\S]+)$/) ){
			var tmpTypeInitial = RegExp.$1;
			var tmpFilePath = RegExp.$2;

			tmpFileDiff.filenameBefore = tmpFilePath;
			tmpFileDiff.filename = tmpFilePath;
			switch(tmpTypeInitial){
				case 'A': tmpFileDiff.type = 'added'; break;
				case 'M': tmpFileDiff.type = 'changed'; break;
				case 'D': tmpFileDiff.type = 'deleted'; break;
				case 'C': tmpFileDiff.type = 'copied'; break;
				case 'T': tmpFileDiff.type = 'type_changed'; break;
				case 'U': tmpFileDiff.type = 'unmerged'; break;
				case 'UU': tmpFileDiff.type = 'unmerged'; break;
				case 'X': tmpFileDiff.type = 'unknown'; break;
				case 'B': tmpFileDiff.type = 'pairing_broken'; break;
			}
			tmpFileDiff.isRenamed = false;
			tmpFileDiff.similarity = false;

			rtn.push(tmpFileDiff);
			return;

		}else if( line.match(/^(R)([0-9]+)\t([^\t]+)\t([^\t]+)$/) ){
			var tmpTypeInitial = RegExp.$1;
			var tmpSimilarity = RegExp.$2;
			var tmpFilePathBefore = RegExp.$3;
			var tmpFilePath = RegExp.$4;

			tmpFileDiff.filenameBefore = tmpFilePathBefore;
			tmpFileDiff.filename = tmpFilePath;
			tmpFileDiff.type = 'changed';
			tmpFileDiff.isRenamed = true;
			tmpFileDiff.similarity = tmpSimilarity.replace(/^0/, '') + '%';

			rtn.push(tmpFileDiff);
			return;
		}
	});

	return rtn;
}
