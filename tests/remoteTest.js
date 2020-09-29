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
const url = require('url');
let gitParser;
let originUrl = __dirname+'/remote';

describe('インスタンス初期化', function() {

	it("インスタンス初期化", function(done) {
		this.timeout(60*1000);

		if( gitRemoteConf ){
			console.info("\n"+"\n"+'**** git-remote.json found.'+"\n"+"\n");
			let parsedUrl = url.parse(gitRemoteConf.url);
			parsedUrl.auth = gitRemoteConf.user+':'+gitRemoteConf.password;
			// console.log(url.format(parsedUrl));
			originUrl = url.format(parsedUrl);
		}

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

	it("git init (remote)", function(done) {
		this.timeout(60*1000);

		var stdout = '';
		var _pathCurrentDir = process.cwd();
		process.chdir( __dirname+'/remote/' );

		var proc = childProc.spawn('git', ['init']);
		proc.stdout.on('data', function(data){
			stdout += data;
		});
		proc.stderr.on('data', function(data){
			stdout += data; // エラー出力も stdout に混ぜて送る
		});
		proc.on('close', function(code){
			done();
		});

		process.chdir( _pathCurrentDir );
		return;
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

	it("git status", function(done) {
		this.timeout(60*1000);

		// new files
		fsEx.writeFileSync(__dirname+'/data/a.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/b.txt', 'master 1'+"\n"+'moved b.txt to e.txt'+"\n");
		fsEx.writeFileSync(__dirname+'/data/c.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/d.txt', 'master 1'+"\n");
		fsEx.writeFileSync(__dirname+'/data/new_and_remove.txt', 'test for AddNew and Remove.'+"\n");

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.notStaged.untracked.length, 6);

			done();

		});
	});

	it("git add .", function(done) {
		this.timeout(60*1000);

		gitParser.git(['add', '.', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.added.length, 6);

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

	it("change file", function(done) {
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

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.currentBranchName, 'master');
			assert.strictEqual(result.notStaged.untracked.length, 2);
			assert.strictEqual(result.notStaged.modified.length, 1);
			assert.strictEqual(result.notStaged.deleted.length, 2);
			assert.strictEqual(result.staged.untracked.length, 0);

			done();

		});
	});

	it("git add .", function(done) {
		this.timeout(60*1000);

		gitParser.git(['add', '.', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.added.length, 3);
			assert.strictEqual(result.removed.length, 2);

			done();

		});
	});

	it("git commit", function(done) {
		this.timeout(60*1000);

		gitParser.git(['commit', '-m', '2nd Commit'+"\n\n"+'Commited by test code.'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);

			done();

		});
	});

	it("git checkout -b test", function(done) {
		this.timeout(60*1000);

		gitParser.git(['checkout', '-b', 'test'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);

			done();

		});
	});

});

describe('git remote', function() {

	it("git remote", function(done) {
		this.timeout(60*1000);

		gitParser.git(['remote'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.equal(typeof(result.remotes), typeof({}));

			done();

		});
	});

	it("git remote add origin", function(done) {
		this.timeout(60*1000);

		gitParser.git(['remote', 'add', 'origin', originUrl], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));

			done();

		});
	});

	it("git remote", function(done) {
		this.timeout(60*1000);

		gitParser.git(['remote'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.equal(typeof(result.remotes), typeof({}));
			assert.equal(result.remotes[0].name, 'origin');

			done();

		});
	});

	it("git remote -v", function(done) {
		this.timeout(60*1000);

		gitParser.git(['remote', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.equal(typeof(result.remotes), typeof({}));
			assert.equal(result.remotes[0].name, 'origin');
			assert.equal(result.remotes[0].fetch, originUrl);
			assert.equal(result.remotes[0].push, originUrl);

			done();

		});
	});

});

describe('git push', function() {

	it("git push origin test:test (new branch)", function(done) {
		this.timeout(60*1000);

		gitParser.git(['push', 'origin', 'test:test'], function(result){
			// console.log(result);
			// console.log(result.stdout);
			// console.log(result.remotes);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.equal(result.remotes[originUrl][0].affect, 'added');
			assert.equal(result.remotes[originUrl][0].branchNameFrom, 'test');
			assert.equal(result.remotes[originUrl][0].remoteBranchName, 'test');

			done();

		});
	});

	it("git push origin test:test (update)", function(done) {
		this.timeout(60*1000);

		// change
		fsEx.writeFileSync(__dirname+'/data/a.txt', 'test 3'+"\n");


		gitParser.git(['add', '.', '-v'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.added.length, 1);
			assert.strictEqual(result.removed.length, 0);

			gitParser.git(['commit', '-m', 'Commit to test branch'+"\n\n"+'Commited by test code.'], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.code, 0);

				gitParser.git(['push', 'origin', 'test:test'], function(result){
					// console.log(result);
					// console.log(result.stdout);
					// console.log(result.remotes);
					assert.equal(typeof(result), typeof({}));
					assert.equal(typeof(result.stdout), typeof(''));
					assert.equal(result.remotes[originUrl][0].affect, 'updated');
					assert.equal(typeof(result.remotes[originUrl][0].commit), typeof(''));
					assert.equal(typeof(result.remotes[originUrl][0].commitFrom), typeof(''));
					assert.equal(result.remotes[originUrl][0].branchNameFrom, 'test');
					assert.equal(result.remotes[originUrl][0].remoteBranchName, 'test');

					done();

				});

			});

		});

	});

	it("git branch", function(done) {
		this.timeout(60*1000);

		gitParser.git(['branch'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.branches.length, 2);
			assert.strictEqual(result.branches[0], 'master');
			assert.strictEqual(result.branches[1], 'test');
			assert.strictEqual(result.localBranches.length, 2);
			assert.strictEqual(result.localBranches[0], 'master');
			assert.strictEqual(result.localBranches[1], 'test');
			assert.strictEqual(result.remoteBranches, undefined);
			assert.strictEqual(result.currentBranchName, 'test');
			done();
		});

	});

	it("git branch -a", function(done) {
		this.timeout(60*1000);

		gitParser.git(['branch', '-a'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.branches.length, 3);
			assert.strictEqual(result.branches[0], 'master');
			assert.strictEqual(result.branches[1], 'test');
			assert.strictEqual(result.branches[2], 'remotes/origin/test');
			assert.strictEqual(result.localBranches.length, 2);
			assert.strictEqual(result.localBranches[0], 'master');
			assert.strictEqual(result.localBranches[1], 'test');
			assert.strictEqual(result.remoteBranches.length, 1);
			assert.strictEqual(result.remoteBranches[0], 'origin/test');
			assert.strictEqual(result.currentBranchName, 'test');
			done();
		});

	});

	it("git branch -r", function(done) {
		this.timeout(60*1000);

		gitParser.git(['branch', '-r'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.branches.length, 1);
			assert.strictEqual(result.branches[0], 'remotes/origin/test');
			assert.strictEqual(result.localBranches, undefined);
			assert.strictEqual(result.remoteBranches.length, 1);
			assert.strictEqual(result.remoteBranches[0], 'origin/test');
			assert.strictEqual(result.currentBranchName, undefined);
			done();
		});

	});
});

describe('git pull', function() {

	it("git branch --delete test (error)", function(done) {
		this.timeout(60*1000);

		gitParser.git(['checkout', 'master'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));

			gitParser.git(['branch', '--delete', 'test'], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.result, false);

				done();

			});

		});
	});

	it("git branch -D test", function(done) {
		this.timeout(60*1000);

		gitParser.git(['branch', '-D', 'test'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.result, true);
			assert.strictEqual(result.branchName, 'test');
			assert.equal(typeof(result.lastCommit), typeof(''));

			done();
		});

	});

	it("git pull origin test:test", function(done) {
		this.timeout(60*1000);

		gitParser.git(['pull', 'origin', 'test:test'], function(result){
			// console.log(result);
			// console.log(result.remotes);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.equal(typeof(result.remotes), typeof({}));
			assert.equal(typeof(result.remotes[originUrl]), typeof([]));
			assert.strictEqual(result.remotes[originUrl][0].affect, 'added');
			assert.strictEqual(result.remotes[originUrl][0].branchName, 'test');
			assert.strictEqual(result.remotes[originUrl][0].remoteBranchNameFrom, 'test');

			done();
		});

	});

});

describe('Cleaning remote branch', function() {

	it("git push -f --delete origin test", function(done) {
		this.timeout(60*1000);

		gitParser.git(['push', '-f', '--delete', 'origin', 'test'], function(result){
			// console.log(result);
			// console.log(result.stdout);
			// console.log(result.remotes);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.equal(result.remotes[originUrl][0].affect, 'deleted');
			assert.equal(result.remotes[originUrl][0].remoteBranchName, 'test');

			done();

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
