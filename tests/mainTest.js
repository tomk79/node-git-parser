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

describe('Utils: parseCmdAry()', function() {
	it("parseCmdAry()", function(done) {
		this.timeout(60*1000);

		var parsedArgs = gitParser.parseCmdAry(['log', '--pretty=oneline', '-p', 'arg1', 'arg2']);
		// console.log(parsedArgs);
		assert.equal(typeof(parsedArgs), typeof({}));
		assert.strictEqual(parsedArgs.options.pretty, 'oneline');
		assert.strictEqual(parsedArgs.options.p, true);
		assert.equal(parsedArgs.args.length, 2);
		assert.strictEqual(parsedArgs.args[0], 'arg1');
		assert.strictEqual(parsedArgs.args[1], 'arg2');

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

describe('git基本操作', function() {

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

	it("git status", function(done) {
		this.timeout(60*1000);

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.notStaged.untracked.length, 0);
			assert.strictEqual(result.staged.untracked.length, 6);

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

describe('git branch 操作', function() {

	it("git branch -a", function(done) {
		this.timeout(60*1000);

		gitParser.git(['branch', '-a'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.branches.length, 1);
			assert.strictEqual(result.branches[0], 'master');
			assert.strictEqual(result.currentBranchName, 'master');

			done();

		});
	});

	it("git checkout -b test_branch_name_001", function(done) {
		this.timeout(60*1000);

		gitParser.git(['checkout', '-b', 'test_branch_name_001'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.result, true);
			assert.strictEqual(result.created, true);
			assert.strictEqual(result.currentBranchName, 'test_branch_name_001');

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
			assert.strictEqual(result.branches.length, 2);
			assert.strictEqual(result.branches[0], 'master');
			assert.strictEqual(result.branches[1], 'test_branch_name_001');
			assert.strictEqual(result.currentBranchName, 'test_branch_name_001');

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
			assert.strictEqual(result.result, true);
			assert.strictEqual(result.created, false);
			assert.strictEqual(result.currentBranchName, 'master');

			done();

		});
	});

});

describe('git log 操作', function() {

	it("git log", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.logs.length, 2);
			assert.equal(typeof(result.logs[0].commit), typeof(''));
			assert.ok(result.logs[0].commit.length > 0);
			assert.strictEqual(result.logs[0].author, 'Tester Tester');
			assert.strictEqual(result.logs[0].email, 'tester@example.com');
			assert.equal(typeof(result.logs[0].date), typeof(''));
			assert.ok(result.logs[0].date.length > 0);

			done();

		});
	});

	it("git log -p", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log', '-p'], function(result){
			// console.log(result);
			// result.logs.forEach(function(line){
			// 	console.log(line);
			// });

			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.logs.length, 2);
			assert.equal(typeof(result.logs[0].commit), typeof(''));
			assert.ok(result.logs[0].commit.length > 0);
			assert.strictEqual(result.logs[0].author, 'Tester Tester');
			assert.strictEqual(result.logs[0].email, 'tester@example.com');
			assert.equal(typeof(result.logs[0].date), typeof(''));
			assert.ok(result.logs[0].date.length > 0);

			// console.log(result.logs[0].files);
			assert.strictEqual(result.logs[0].files.length, 4);

			assert.strictEqual(result.logs[0].files[0].filenameBefore, 'a.txt');
			assert.strictEqual(result.logs[0].files[0].filename, 'a.txt');
			assert.strictEqual(result.logs[0].files[0].type, 'changed');
			assert.strictEqual(result.logs[0].files[0].isRenamed, false);
			assert.strictEqual(result.logs[0].files[0].similarity, false);
			assert.strictEqual(result.logs[0].files[0].index.from, '35a087c');
			assert.strictEqual(result.logs[0].files[0].index.to, '08bda82');
			assert.strictEqual(result.logs[0].files[0].mode, '100644');

			assert.strictEqual(result.logs[0].files[1].filenameBefore, 'b.txt');
			assert.strictEqual(result.logs[0].files[1].filename, 'e.txt');
			assert.strictEqual(result.logs[0].files[1].type, 'changed');
			assert.strictEqual(result.logs[0].files[1].isRenamed, true);
			assert.strictEqual(result.logs[0].files[1].similarity, '70%');
			assert.strictEqual(result.logs[0].files[1].index.from, '4cc9312');
			assert.strictEqual(result.logs[0].files[1].index.to, '3faea0b');
			assert.strictEqual(result.logs[0].files[1].mode, '100644');

			assert.strictEqual(result.logs[0].files[2].filenameBefore, 'new.txt');
			assert.strictEqual(result.logs[0].files[2].filename, 'new.txt');
			assert.strictEqual(result.logs[0].files[2].type, 'added');
			assert.strictEqual(result.logs[0].files[2].isRenamed, false);
			assert.strictEqual(result.logs[0].files[2].similarity, false);
			assert.strictEqual(result.logs[0].files[2].index.from, '0000000');
			assert.strictEqual(result.logs[0].files[2].index.to, '08bda82');
			assert.strictEqual(result.logs[0].files[2].mode, '100644');

			assert.strictEqual(result.logs[0].files[3].filenameBefore, 'new_and_remove.txt');
			assert.strictEqual(result.logs[0].files[3].filename, 'new_and_remove.txt');
			assert.strictEqual(result.logs[0].files[3].type, 'deleted');
			assert.strictEqual(result.logs[0].files[3].isRenamed, false);
			assert.strictEqual(result.logs[0].files[3].similarity, false);
			assert.strictEqual(result.logs[0].files[3].index.from, 'f9016de');
			assert.strictEqual(result.logs[0].files[3].index.to, '0000000');
			assert.strictEqual(result.logs[0].files[3].mode, '100644');

			done();

		});
	});

	it("git log -p --word-diff", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log', '-p', '--word-diff'], function(result){
			// console.log(result.logs);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.logs.length, 2);
			assert.strictEqual(result.logs[0].author, 'Tester Tester');
			assert.strictEqual(result.logs[0].email, 'tester@example.com');

			done();

		});
	});

	it("git log --stat", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log', '--stat'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			// assert.strictEqual(result.logs.length, 2);
			// assert.strictEqual(result.logs[0].author, 'Tester Tester');
			// assert.strictEqual(result.logs[0].email, 'tester@example.com');

			done();

		});
	});

	it("git log --pretty=oneline", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log', '--pretty=oneline'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			// assert.strictEqual(result.logs.length, 2);
			// assert.strictEqual(result.logs[0].author, 'Tester Tester');
			// assert.strictEqual(result.logs[0].email, 'tester@example.com');

			done();

		});
	});

	it("git log --name-status", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log', '--name-status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.logs.length, 2);
			assert.strictEqual(result.logs[0].author, 'Tester Tester');
			assert.strictEqual(result.logs[0].email, 'tester@example.com');

			// console.log(result.logs[0].files);
			assert.strictEqual(result.logs[0].files.length, 4);
			assert.strictEqual(result.logs[0].files[0].filenameBefore, 'a.txt');
			assert.strictEqual(result.logs[0].files[0].filename, 'a.txt');
			assert.strictEqual(result.logs[0].files[0].type, 'changed');
			assert.strictEqual(result.logs[0].files[0].isRenamed, false);
			assert.strictEqual(result.logs[0].files[0].similarity, false);
			assert.strictEqual(result.logs[0].files[1].filenameBefore, 'b.txt');
			assert.strictEqual(result.logs[0].files[1].filename, 'e.txt');
			assert.strictEqual(result.logs[0].files[1].type, 'changed');
			assert.strictEqual(result.logs[0].files[1].isRenamed, true);
			assert.strictEqual(result.logs[0].files[1].similarity, '70%');
			assert.strictEqual(result.logs[0].files[2].filenameBefore, 'new.txt');
			assert.strictEqual(result.logs[0].files[2].filename, 'new.txt');
			assert.strictEqual(result.logs[0].files[2].type, 'added');
			assert.strictEqual(result.logs[0].files[2].isRenamed, false);
			assert.strictEqual(result.logs[0].files[2].similarity, false);
			assert.strictEqual(result.logs[0].files[3].filenameBefore, 'new_and_remove.txt');
			assert.strictEqual(result.logs[0].files[3].filename, 'new_and_remove.txt');
			assert.strictEqual(result.logs[0].files[3].type, 'deleted');
			assert.strictEqual(result.logs[0].files[3].isRenamed, false);
			assert.strictEqual(result.logs[0].files[3].similarity, false);

			// console.log(result.logs[1].files);
			assert.strictEqual(result.logs[1].files.length, 6);

			done();

		});
	});

	/*
	MEMO:
	git log -p --word-diff
	git log --stat
	git log --pretty=oneline
	git log --pretty=short
	git log --pretty=full
	git log --pretty=fuller
	git log --pretty=format:"%h - %an, %ar : %s"
	*/

});

describe('git diff 操作', function() {
	it("git diff", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log', '--name-status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.logs.length, 2);

			gitParser.git(['diff', result.logs[1].commit+'...'+result.logs[0].commit], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.code, 0);

				// console.log(result.diff);
				assert.strictEqual(result.diff.length, 4);
				assert.strictEqual(result.diff[0].filenameBefore, 'a.txt');
				assert.strictEqual(result.diff[0].filename, 'a.txt');
				assert.strictEqual(result.diff[0].type, 'changed');
				assert.strictEqual(result.diff[0].isRenamed, false);
				assert.strictEqual(result.diff[0].similarity, false);
				assert.strictEqual(result.diff[1].filenameBefore, 'b.txt');
				assert.strictEqual(result.diff[1].filename, 'e.txt');
				assert.strictEqual(result.diff[1].type, 'changed');
				assert.strictEqual(result.diff[1].isRenamed, true);
				assert.strictEqual(result.diff[1].similarity, '70%');
				assert.strictEqual(result.diff[2].filenameBefore, 'new.txt');
				assert.strictEqual(result.diff[2].filename, 'new.txt');
				assert.strictEqual(result.diff[2].type, 'added');
				assert.strictEqual(result.diff[2].isRenamed, false);
				assert.strictEqual(result.diff[2].similarity, false);
				assert.strictEqual(result.diff[3].filenameBefore, 'new_and_remove.txt');
				assert.strictEqual(result.diff[3].filename, 'new_and_remove.txt');
				assert.strictEqual(result.diff[3].type, 'deleted');
				assert.strictEqual(result.diff[3].isRenamed, false);
				assert.strictEqual(result.diff[3].similarity, false);

				done();

			});

		});
	});

	it("git diff --name-status", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log', '--name-status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.logs.length, 2);

			gitParser.git(['diff', '--name-status', result.logs[1].commit+'...'+result.logs[0].commit], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.code, 0);

				// console.log(result.diff);
				assert.strictEqual(result.diff.length, 4);
				assert.strictEqual(result.diff[0].filenameBefore, 'a.txt');
				assert.strictEqual(result.diff[0].filename, 'a.txt');
				assert.strictEqual(result.diff[0].type, 'changed');
				assert.strictEqual(result.diff[0].isRenamed, false);
				assert.strictEqual(result.diff[0].similarity, false);
				assert.strictEqual(result.diff[1].filenameBefore, 'b.txt');
				assert.strictEqual(result.diff[1].filename, 'e.txt');
				assert.strictEqual(result.diff[1].type, 'changed');
				assert.strictEqual(result.diff[1].isRenamed, true);
				assert.strictEqual(result.diff[1].similarity, '70%');
				assert.strictEqual(result.diff[2].filenameBefore, 'new.txt');
				assert.strictEqual(result.diff[2].filename, 'new.txt');
				assert.strictEqual(result.diff[2].type, 'added');
				assert.strictEqual(result.diff[2].isRenamed, false);
				assert.strictEqual(result.diff[2].similarity, false);
				assert.strictEqual(result.diff[3].filenameBefore, 'new_and_remove.txt');
				assert.strictEqual(result.diff[3].filename, 'new_and_remove.txt');
				assert.strictEqual(result.diff[3].type, 'deleted');
				assert.strictEqual(result.diff[3].isRenamed, false);
				assert.strictEqual(result.diff[3].similarity, false);

				done();

			});

		});
	});

});

describe('git show 操作', function() {

	it("git show", function(done) {
		this.timeout(60*1000);

		gitParser.git(['log'], function(result){
			// console.log(result);
			assert.equal(typeof(result.logs[0].commit), typeof(''));

			var commit = result.logs[0].commit;
			gitParser.git(['show', commit], function(result){
				// console.log(result);
				assert.equal(typeof(result), typeof({}));
				assert.equal(typeof(result.stdout), typeof(''));
				assert.strictEqual(result.code, 0);

				assert.equal(typeof(result.commit), typeof(''));
				assert.ok(result.commit.length > 0);
				assert.strictEqual(result.author, 'Tester Tester');
				assert.strictEqual(result.email, 'tester@example.com');
				assert.equal(typeof(result.date), typeof(''));
				assert.ok(result.date.length > 0);

				// console.log(result.files);
				assert.strictEqual(result.files.length, 4);

				assert.strictEqual(result.files[0].filenameBefore, 'a.txt');
				assert.strictEqual(result.files[0].filename, 'a.txt');
				assert.strictEqual(result.files[0].type, 'changed');
				assert.strictEqual(result.files[0].isRenamed, false);
				assert.strictEqual(result.files[0].similarity, false);
				assert.strictEqual(result.files[0].index.from, '35a087c');
				assert.strictEqual(result.files[0].index.to, '08bda82');
				assert.strictEqual(result.files[0].mode, '100644');

				done();
			});

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
