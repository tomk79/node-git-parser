const assert = require('assert');
const childProc = require('child_process');
const fsEx = require('fs-extra');
const GitParser = require('../libs/main.js');
let gitParser;

describe('インスタンス初期化', function() {

	it("インスタンス初期化", function(done) {
		this.timeout(60*1000);

		gitParser = new GitParser(function(cmdAry, callback){
			var stdout = '';
			var _pathCurrentDir = process.cwd();
			process.chdir( __dirname+'/data/' );

			var proc = childProc.spawn('git', cmdAry);
			proc.stdout.on('data', function(data){
				stdout += data;
			});
			proc.stderr.on('data', function(data){
				stdout += data; // エラー出力も stdout に混ぜて送る
			});
			proc.on('close', function(code){
				callback(code, stdout);
			});

			process.chdir( _pathCurrentDir );
			return;
		});
		assert.equal(typeof(gitParser), typeof({}));

		done();
	});
});

describe('git操作', function() {

	it("git init", function(done) {
		this.timeout(60*1000);

		gitParser.git(['init'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));

			done();

		});
	});

	it("git status", function(done) {
		this.timeout(60*1000);

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.untrackedFiles.length, 1);
			assert.strictEqual(result.code, 0);

			done();

		});
	});

});

describe('Cleaning', function() {

	it("Clearning .git", function(done) {
		this.timeout(60*1000);
		fsEx.removeSync(__dirname+'/data/');
		fsEx.mkdirSync(__dirname+'/data/');
		fsEx.writeFileSync(__dirname+'/data/.gitkeep', '');

		done();
	});

});
