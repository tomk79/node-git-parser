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

		fsEx.writeFileSync(__dirname+'/data/a.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/b.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/c.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/d.txt', 'master 1'+"\n");

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
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.notStaged.untracked.length, 5);

			done();

		});
	});

	it("git add .", function(done) {
		this.timeout(60*1000);

		gitParser.git(['add', '.', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.added.length, 5);

			done();

		});
	});

	it("git status", function(done) {
		this.timeout(60*1000);

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.notStaged.untracked.length, 0);
			assert.strictEqual(result.staged.untracked.length, 5);

			done();

		});
	});

	it("git commit", function(done) {
		this.timeout(60*1000);

		gitParser.git(['commit', '-m', 'Initial Commit'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);

			done();

		});
	});

	it("git status", function(done) {
		this.timeout(60*1000);

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.currentBranchName, 'master');
			assert.strictEqual(result.notStaged.untracked.length, 0);
			assert.strictEqual(result.staged.untracked.length, 0);

			done();

		});
	});

	it("change file", function(done) {
		this.timeout(60*1000);

		fsEx.writeFileSync(__dirname+'/data/a.txt', 'master 2'+"\n");
		fsEx.removeSync(__dirname+'/data/b.txt');
		fsEx.writeFileSync(__dirname+'/data/e.txt', 'master 1'+"\n");

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.currentBranchName, 'master');
			assert.strictEqual(result.notStaged.untracked.length, 1);
			assert.strictEqual(result.notStaged.modified.length, 1);
			assert.strictEqual(result.notStaged.deleted.length, 1);
			assert.strictEqual(result.staged.untracked.length, 0);

			done();

		});
	});

});

describe('Errors', function() {

	it("git foobar", function(done) {
		this.timeout(60*1000);

		gitParser.git(['foobar'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 1);
			assert.strictEqual(result.errors.length, 1);

			done();

		});
	});

});

describe('Cleaning', function() {

	it("Clearning data directory", function(done) {
		this.timeout(60*1000);
		fsEx.removeSync(__dirname+'/data/');
		fsEx.mkdirSync(__dirname+'/data/');
		fsEx.writeFileSync(__dirname+'/data/.gitkeep', '');

		done();
	});

});
