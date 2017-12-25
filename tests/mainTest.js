var assert = require('assert');
var GitParser = require('../libs/main.js');

describe('インスタンス初期化', function() {

	it("インスタンス初期化", function(done) {
		this.timeout(60*1000);

		var gitParser = new GitParser();
		assert.equal(typeof(gitParser), typeof({}));

		done();
	});

});
