/**
 * git config
 */
module.exports = function(cmdAry, result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	// console.log(lines);
	var mode = null;

	var parsedCmd = this.parseCmdAry(cmdAry);
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
