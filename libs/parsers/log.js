/**
 * git log
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var _this = this;
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
    result.logs = [];
    var tmpLog = {},
		tmpLogs = [];
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
				if( tmpLog.commit ){
					tmpLogs.push(tmpLog);
				}
				tmpLog = {};
				tmpLog.commit = RegExp.$1;
				tmpLog.stdout = [];
				tmpLog.stdout.push(line);
				phase = 'log_header';
				return;
			}
			tmpLog.stdout.push(line);
			return;
		});
		if( tmpLog.commit ){
			tmpLogs.push(tmpLog);
		}

		tmpLogs.forEach(function(logStdout){
			var fres = {};
			fres.code = 0;
			fres.stdout = logStdout.stdout.join("\n");
			fres.errors = [];

			var showCmd = [];
			showCmd.push('show');
			if( parsedCmd.options['name-status'] ){
				showCmd.push('--name-status');
			}
			showCmd.push(logStdout.commit);

			_this.show(
				showCmd,
				fres,
				function(res){
					delete(res.code);
					delete(res.stdout);
					delete(res.errors);
					result.logs.push(res);
				}
			);
		});
	}

	// console.log(result);
	callback(result);
}
