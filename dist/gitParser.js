(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
			case 'status':
			case 'add':
			case 'commit':
				_this[cmdAry[0]](rtn, function(result){
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
module.exports.prototype.status = require('./parsers/status.js');
module.exports.prototype.add = require('./parsers/add.js');
module.exports.prototype.commit = require('./parsers/commit.js');

},{"./parsers/add.js":2,"./parsers/commit.js":3,"./parsers/init.js":4,"./parsers/status.js":5}],2:[function(require,module,exports){
/**
 * git add
 */
module.exports = function(result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
    if( !result.stdout.length ){
        callback(result);
        return;
    }
	result.addedFiles = [];

	lines.forEach(function(line){

        if( line.match(/^add\ \'([\s\S]*)\'$/g) ){
            result.addedFiles.push( RegExp.$1 );
        }
	});

	// console.log(result);
	callback(result);
}

},{}],3:[function(require,module,exports){
/**
 * git commit
 */
module.exports = function(result, callback){
	callback = callback || function(){}
    // TODO: 解析処理を書く
	callback(result);
}

},{}],4:[function(require,module,exports){
/**
 * git init
 */
module.exports = function(result, callback){
	callback = callback || function(){}
    // TODO: 解析処理を書く
	callback(result);
}

},{}],5:[function(require,module,exports){
/**
 * git status
 */
module.exports = function(result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
	var phase = null;
	result.untrackedFiles = [];
	result.newFiles = [];
	result.modifiedFiles = [];
	result.deletedFiles = [];
	// console.log(lines);

	lines.forEach(function(line){

		// --------------------------------------
		// Branch Name
		if( !phase ){
			if( line.match(/^On\ branch\ ([\s\S]*)$/g) ){
				result.currentBranchName = RegExp.$1;
			}
		}

		// --------------------------------------
		// Untracked files
		if( line == 'Untracked files:' ){
			phase = 'untracked_files_standby';
			return;
		}else if(phase == 'untracked_files_standby'){
			if( !line.length ){
				phase = 'untracked_files';
				return;
			}
		}else if(phase == 'untracked_files'){
			if( !line.length ){
				phase = null;
				return;
			}
			if( line.match(/^[\s]*([\s\S]*?)$/g) ){
				result.untrackedFiles.push( RegExp.$1 );
				return;
			}
		}

		// --------------------------------------
		// Staged
		if( line == 'Changes to be committed:' ){
			phase = 'changes_to_be_committed_standby';
			return;
		}else if(phase == 'changes_to_be_committed_standby'){
			if( !line.length ){
				phase = 'changes_to_be_committed';
				return;
			}
		}else if(phase == 'changes_to_be_committed'){
			if( !line.length ){
				phase = null;
				return;
			}
			if( line.match(/^[\s]*new\ file\:[\s]+([\s\S]*?)$/g) ){
				result.newFiles.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\s]*modified\:[\s]+([\s\S]*?)$/g) ){
				result.modifiedFiles.push( RegExp.$1 );
				return;
			}else if( line.match(/^[\s]*deleted\:[\s]+([\s\S]*?)$/g) ){
				result.deletedFiles.push( RegExp.$1 );
				return;
			}
		}
	});

	// console.log(result);
	callback(result);
}

},{}],6:[function(require,module,exports){
window.GitParser = require('../libs/main.js');

},{"../libs/main.js":1}]},{},[6])