/**
 * git config
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	// console.log(lines);
	var mode = null;

	var parsedCmd = (function(cmdAry){
		var rtn = {
			"options": {},
			"args": []
		};
		cmdAry.forEach(function(cmdLine, idx){
			if( !idx ){return;}
			// console.log(cmdLine, idx);
			if( cmdLine.match(/^\-\-?([a-zA-Z]+?)$/) ){
				rtn.options[RegExp.$1] = true;
				return;
			}
			rtn.args.push(cmdLine);
		});
		return rtn;
	})(cmdAry);
	// console.log(parsedCmd);

	result.property = parsedCmd.args[0];
	if( parsedCmd.args.length == 1 ){
		mode = 'get';
	}else{
		mode = 'set';
	}

	if( mode == 'get' ){
		switch( result.property ){
			case 'user.name':
				result.name = lines[0];break;
			case 'user.email':
				result.email = lines[0];break;
		}
	}

	// console.log(result);
	callback(result);
}
