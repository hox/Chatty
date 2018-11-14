var crypto = require('crypto');

var rtg = module.exports = {};

// Module defaults
rtg.STRONG_KEY_LEN = 32;
rtg.WEAK_KEY_LEN = 16;

rtg.generateKey = function(opts, done) {
	// Setup the option defaults
	if (typeof opts === 'function') {
		done = opts;
		opts = {};
	}
	opts = opts || {};
	opts.len = opts.len || (opts.strong ? rtg.STRONG_KEY_LEN : rtg.WEAK_KEY_LEN);
	opts.done = opts.done || done || function() {};

	// String can be boolean or a string representing an encoding
	if ((!Buffer.isEncoding(opts.string) && opts.string !== false) || opts.string === 'base64' || opts.string === 'utf8') {
		opts.string = 'hex';
	}

	// in some encodings then string is twice the number of characters as the number of bytes
	if (opts.string === 'hex') {
		opts.len = opts.string ? opts.len / 2 : opts.len;
	}

	// strong or weak key?
	var fnc = opts.strong ? rtg._generateStrongKey : rtg._generateWeakKey;
	return fnc(opts.len, opts.string, opts.retry, opts.done);
};

rtg._generateStrongKey = function(len, str, retry, done) {
	// Generate the random bytes
	return crypto.randomBytes(len, function(err, key) {
		if (err && retry === false) {
			return done(err);
		} else if (err) {
			return rtg._generateStrongKey(len, str, false, done);
		}
		
		done(null, str ? key.toString(str) : key);
	});
};

rtg._generateWeakKey = function(len, str, retry, done) {
	// Generate the psuedo-random bytes
	return crypto.pseudoRandomBytes(len, function(err, key) {
		if (err && retry === false) {
			return done(err);
		} else if (err) {
			return rtg._generateWeakKey(len, str, false, done);
		}
		
		done(null, str ? key.toString(str) : key);
	});
};
