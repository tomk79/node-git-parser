/**
 * git remote
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    var tmpLines=[], tmpLog;

	var parsedCmd = this.parseCmdAry(cmdAry);

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

	}else if( cmdAry.length == 2 && parsedCmd.options.v ){
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

	}else if( cmdAry[1] == 'add' ){
		// git remote add
		// 出力なし
	}

	callback(result);
}
