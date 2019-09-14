/**
 * git remote
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    var tmpLines=[], tmpLog;
	// console.log(lines);

	var parsedCmd = this.parseCmdAry(cmdAry);
	// console.log(parsedCmd);

	if( cmdAry.length == 1 && cmdAry[0] == 'remote' ){
		// オプションなし
		var remotes = [];
		lines.forEach(function(line){
			if(!line.length){return;}
			var remote = {};
			remote.name = line;
			remotes.push(remote);
		});
		result.remotes = remotes;

	}else if(  cmdAry.length == 2 && parsedCmd.options.v ){
		// -v
		var remotes = {};
		lines.forEach(function(line){
			if(!line.length){return;}
			if( !line.match(/^([^\s]+)\t([^\s]*)\ \(([^\s]+)\)$/) ){
				result.errors.push('Failed to parse row: '+line);
				return;
			}
			var name = RegExp.$1;
			var url = RegExp.$2;
			var direction = RegExp.$3;
			if( !remotes[name] ){
				remotes[name] = {};
			}
			remotes[name].name = name;
			remotes[name][direction] = url;
		});
		result.remotes = [];
		for(var idx in remotes){
			result.remotes.push(remotes[idx]);
		}

	}else if(  cmdAry[1] == 'add' ){
		// git remote add
		// 出力なし
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
	// console.log(lines);

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
