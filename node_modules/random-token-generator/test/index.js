var assert = require('assert'),
	rtg = require('../'),
	parallel = require('run-parallel');

describe('Random Token Generator', function() {

	it('should generate a token', function(done) {
		rtg.generateKey(function(err, key) {
			assert.equal(err, null);
			assert.equal(key.length, 16);
			assert.equal(typeof key, 'string');
			done();
		});
	});

	it('should generate a buffer token of a given number of bytes', function(done) {
		rtg.generateKey({
			len: 10,
			string: false
		}, function(err, key) {
			assert.equal(err, null);
			assert.equal(key.length, 10);
			assert(key instanceof Buffer);
			done();
		});
	});

	it('should default to hex when an invalid encoding is specified', function(done) {
		rtg.generateKey({
			string: 'foobar'
		}, function(err, key) {
			assert.equal(err, null);
			assert.equal(typeof key, 'string');
			var b = new Buffer(key, 'hex');
			assert.equal(b.length, 8);
			done();
		});
	});

	it('should return the right length key for different encodings', function(done) {
		parallel([
			function(done) {
				rtg.generateKey({
					len: 10,
					string: 'ascii'
				}, function(err, key) {
					assert.equal(err, null);
					assert.equal(key.length, 10);
					done();
				});
			},
			function(done) {
				rtg.generateKey({
					len: 10,
					string: 'hex'
				}, function(err, key) {
					assert.equal(err, null);
					assert.equal(key.length, 10);
					done();
				});
			}
		], done);
	});
});
