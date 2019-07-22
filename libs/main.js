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
				'stdout': stdout,
				'errors': []
			};
			if( stdout.match(/^fatal\:\ ([\s\S]*)$/g) ){
				rtn.errors.push( RegExp.$1 );
				callback(rtn);
				return;
			}
			switch( cmdAry[0] ){
				case 'init':
				case 'status':
				case 'add':
					_this[cmdAry[0]](rtn, function(result){
						callback(result);
					});
					break;
				default:
					callback(rtn);
					break;
			}
			return;
		});
	}
}
module.exports.prototype.init = require('./parsers/init.js');
module.exports.prototype.status = require('./parsers/status.js');
module.exports.prototype.add = require('./parsers/add.js');
