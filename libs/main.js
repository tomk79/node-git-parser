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
			_this.parse(cmdAry, code, stdout, callback);
			return;
		});
	}
	this.parse = function(cmdAry, code, stdout, callback){
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

		if( rtn.stdout.match(/^git\:\ (\'([\s\S]*?)\'\ is\ not\ a\ git\ command\.)/g) ){
			rtn.errors.push(RegExp.$1);
		}else if(rtn.code !== 0){
			rtn.errors.push(rtn.stdout);
		}

		switch( cmdAry[0] ){
			case 'init':
			case 'config':
			case 'status':
			case 'add':
			case 'commit':
			case 'branch':
			case 'checkout':
			case 'log':
			case 'diff':
			case 'show':
			case 'remote':
			case 'push':
			case 'pull':
				_this[cmdAry[0]](cmdAry, rtn, function(result){
					callback(result);
				});
				break;
			default:
				callback(rtn);
				break;
		}
		return;
	}
}

module.exports.prototype.init = require('./parsers/init.js');
module.exports.prototype.config = require('./parsers/config.js');
module.exports.prototype.status = require('./parsers/status.js');
module.exports.prototype.add = require('./parsers/add.js');
module.exports.prototype.commit = require('./parsers/commit.js');
module.exports.prototype.branch = require('./parsers/branch.js');
module.exports.prototype.checkout = require('./parsers/checkout.js');
module.exports.prototype.log = require('./parsers/log.js');
module.exports.prototype.diff = require('./parsers/diff.js');
module.exports.prototype.show = require('./parsers/show.js');
module.exports.prototype.remote = require('./parsers/remote.js');
module.exports.prototype.push = require('./parsers/push.js');
module.exports.prototype.pull = require('./parsers/pull.js');

/**
 * コマンド配列を解析する
 */
module.exports.prototype.parseCmdAry = function(cmdAry){
	var rtn = {
		"options": {},
		"args": []
	};
	cmdAry.forEach(function(cmdLine, idx){
		if( !idx ){return;}
		// console.log(cmdLine, idx);
		if( cmdLine.match(/^\-\-?([a-zA-Z\-/.]+?)(?:\=([a-zA-Z\-/.]+))?$/) ){
			var key = RegExp.$1;
			var val = RegExp.$2;
			rtn.options[key] = true;
			if( val ){
				rtn.options[key] = val;
			}
			return;
		}
		rtn.args.push(cmdLine);
	});
	return rtn;
}
