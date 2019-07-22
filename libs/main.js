/**
 * git-parser.js
 */
module.exports = function(fncCallGit){
	var _this = this;
	fncCallGit = fncCallGit || function(callback){
		callback = callback || function(){}
		callback(0, '');
	}
	this.git = function(cmdAry, callback){
		fncCallGit(cmdAry, function(code, stdout){
			var rtn = {
				'code': code,
				'stdout': stdout
			};
			if(cmdAry[0] == 'init'){
				_this.init(rtn, function(result){
					callback(result);
				});
			}else if(cmdAry[0] == 'status'){
				_this.status(rtn, function(result){
					callback(result);
				});
			}else{
				callback(rtn);
			}
			return;
		});
	}
}
module.exports.prototype.init = require('./parsers/init.js');
module.exports.prototype.status = require('./parsers/status.js');
