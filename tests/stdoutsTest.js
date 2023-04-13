const assert = require('assert');
const childProc = require('child_process');
const fsEx = require('fs-extra');
const GitParser = require('../libs/main.js');

describe('バリエーション', function() {

	it("git status", function(done) {
		const gitParser = new GitParser(function(cmdAry, callback){
			var stdout = fsEx.readFileSync(__dirname + '/stdouts/git-status.txt');
			callback(0, stdout.toString());
			return;
		});

		this.timeout(60*1000);

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.currentBranchName, 'main');
			assert.strictEqual(result.remoteBranchName, 'origin/main');
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.notStaged.modified.length, 2);
			assert.strictEqual(result.isUnmerged, false);

			done();

		});
	});

	it("git status", function(done) {
		const gitParser = new GitParser(function(cmdAry, callback){
			var stdout = fsEx.readFileSync(__dirname + '/stdouts/git-status-staged.txt');
			callback(0, stdout.toString());
			return;
		});

		this.timeout(60*1000);

		gitParser.git(['status'], function(result){
			// console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.currentBranchName, 'main');
			assert.strictEqual(result.code, 0);
			assert.strictEqual(result.staged.modified.length, 2);
			assert.strictEqual(result.isUnmerged, false);

			done();

		});
	});

	it("git diff -U12 hoge/fuga.txt", function(done) {
		const gitParser = new GitParser(function(cmdAry, callback){
			var stdout = fsEx.readFileSync(__dirname + '/stdouts/git-diff.txt');
			callback(0, stdout.toString());
			return;
		});

		this.timeout(60*1000);

		gitParser.git(['diff', '-U12'], function(result){
			console.log(result);
			assert.equal(typeof(result), typeof({}));
			assert.equal(typeof(result.stdout), typeof(''));
			assert.strictEqual(result.diff.length, 1);
			assert.strictEqual(result.diff[0].filenameBefore, 'testdata/test.jsx');
			assert.strictEqual(result.diff[0].filename, 'testdata/test.jsx');
			assert.strictEqual(result.diff[0].type, 'changed');
			assert.strictEqual(result.diff[0].isRenamed, false);
			assert.strictEqual(result.diff[0].similarity, false);
			done();

		});
	});

});
