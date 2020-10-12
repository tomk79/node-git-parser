const assert = require('assert');
const childProc = require('child_process');
const fsEx = require('fs-extra');
const GitParser = require('../libs/main.js');
const gitRemoteConf = (function( pathJson ){
	let rtn = false;
	if( fsEx.existsSync(pathJson) ){
		rtn = require(pathJson);
	}
	return rtn;
})(__dirname+'/../git-remote.json');
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

describe('git初期化', function() {

	it("git init", function(done) {
		this.timeout(60*1000);

		gitParser.git(['init'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));

			done();

		});
	});

	it("git config user.name \"Tester Tester\"", function(done) {
		this.timeout(60*1000);

		gitParser.git(['config', 'user.name', 'Tester Tester'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));

			// 検算
			gitParser.git(['config', 'user.name'], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.name, 'Tester Tester');
				done();
			});

		});
	});

	it("git config user.email \"tester@example.com\"", function(done) {
		this.timeout(60*1000);

		gitParser.git(['config', 'user.email', 'tester@example.com'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));

			// 検算
			gitParser.git(['config', 'user.email'], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.email, 'tester@example.com');
				done();
			});

		});
	});

});

describe('コンフリクト状態の成立', function() {

	it("create master branch", function(done) {
		this.timeout(60*1000);

		// new files
		fsEx.writeFileSync(__dirname+'/data/a.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/b.txt', 'master 1'+"\n"+'moved b.txt to e.txt'+"\n");
		fsEx.writeFileSync(__dirname+'/data/c.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/d.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/new_and_remove.txt', 'test for AddNew and Remove.'+"\n");

		gitParser.git(['add', '.', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.added.length, 6);

			gitParser.git(['commit', '-m', 'Initial Commit'], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.code, 0);

				done();

			});

		});
	});

	it("git checkout -b develop", function(done) {
		this.timeout(60*1000);

		gitParser.git(['checkout', '-b', 'develop'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.currentBranchName, 'develop');

			done();

		});
	});

	it("change file (develop)", function(done) {
		this.timeout(60*1000);

		// new
		fsEx.writeFileSync(__dirname+'/data/new.txt', 'develop 2'+"\n");

		// change
		fsEx.writeFileSync(__dirname+'/data/a.txt', 'develop 2'+"\n");

		// move
		fsEx.removeSync(__dirname+'/data/b.txt');
		fsEx.writeFileSync(__dirname+'/data/e.txt', 'develop 2'+"\n"+'moved b.txt to e.txt'+"\n");

		// remove
		fsEx.removeSync(__dirname+'/data/new_and_remove.txt');

		gitParser.git(['add', '.', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.added.length, 3);
			assert.strictEqual(result.removed.length, 2);

			gitParser.git(['commit', '-m', '2nd Commit - develop'+"\n\n"+'Commited by test code.'], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.code, 0);

				done();

			});

		});
	});

	it("git status", function(done) {
		this.timeout(60*1000);

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.currentBranchName, 'develop');
			assert.strictEqual(result.notStaged.untracked.length, 0);
			assert.strictEqual(result.staged.untracked.length, 0);
			assert.strictEqual(result.isUnmerged, false);

			done();

		});
	});

	it("git checkout master", function(done) {
		this.timeout(60*1000);

		gitParser.git(['checkout', 'master'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.currentBranchName, 'master');

			done();

		});
	});

	it("change file (master)", function(done) {
		this.timeout(60*1000);

		// new
		fsEx.writeFileSync(__dirname+'/data/new.txt', 'master 2'+"\n");

		// change
		fsEx.writeFileSync(__dirname+'/data/a.txt', 'master 2'+"\n");

		// move
		fsEx.removeSync(__dirname+'/data/b.txt');
		fsEx.writeFileSync(__dirname+'/data/e.txt', 'master 2'+"\n"+'moved b.txt to e.txt'+"\n");

		// remove
		fsEx.removeSync(__dirname+'/data/new_and_remove.txt');

		gitParser.git(['add', '.', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.added.length, 3);
			assert.strictEqual(result.removed.length, 2);

			gitParser.git(['commit', '-m', '2nd Commit - master'+"\n\n"+'Commited by test code.'], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.code, 0);

				done();

			});

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

});

describe('Merge and Conflict', function() {
	it("git merge develop", function(done) {
		this.timeout(60*1000);

		// TODO: merge コマンドの解析は未実装
		gitParser.git(['merge', 'develop'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 1);
			// assert.strictEqual(result.currentBranchName, 'master');
			// assert.strictEqual(result.notStaged.untracked.length, 0);
			// assert.strictEqual(result.staged.untracked.length, 0);

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
			assert.strictEqual(result.unmerged.bothAdded.length, 1);
			assert.strictEqual(result.unmerged.bothModified.length, 2);
			assert.strictEqual(result.isUnmerged, true);

			done();

		});
	});

	it("git checkout --theirs ./", function(done) {
		this.timeout(60*1000);

		gitParser.git(['checkout', '--theirs', './'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			// assert.strictEqual(result.currentBranchName, 'master');
			// assert.strictEqual(result.notStaged.untracked.length, 0);
			// assert.strictEqual(result.staged.untracked.length, 0);

			done();

		});
	});

	it("git add/commit", function(done) {
		this.timeout(60*1000);

		gitParser.git(['add', './'], function(result){
			// console.log(result);
			gitParser.git(['commit', '-m', 'Merged'], function(result){
				// console.log(result);
				gitParser.git(['status'], function(result){
					// console.log(result);
					assert.equal(typeof(result), typeof({}));
					assert.equal(typeof(result.stdout), typeof(''));
					assert.strictEqual(result.code, 0);
					assert.strictEqual(result.currentBranchName, 'master');

					done();

				});

			});

		});
	});
});

describe('Cleaning local files', function() {

	it("Clearning data directory", function(done) {
		this.timeout(60*1000);

		fsEx.removeSync(__dirname+'/data/');
		fsEx.mkdirSync(__dirname+'/data/');
		fsEx.writeFileSync(__dirname+'/data/.gitkeep', '');

		fsEx.removeSync(__dirname+'/remote/');
		fsEx.mkdirSync(__dirname+'/remote/');
		fsEx.writeFileSync(__dirname+'/remote/.gitkeep', '');

		done();
	});

});
