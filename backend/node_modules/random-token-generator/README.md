# Generate Random Tokens

Generates both strong and weak crytographic tokens.  Provides a simple interface over the `crypto` module to get random character strings or random byte buffers.

## Install

```
$ npm install --save random-token-generator
```

## Usage

```javascript
var rtg = require('random-token-generator');

// The below options are also the defaults
rtg.generateKey({
	len: 16 // Generate 16 characters or bytes of data
	string: true, // Output keys as a hex string
	strong: false, // Use the crypographically secure randomBytes function
	retry: false // Retry once on error
}, function(err, key) {
	console.log(err, key);
	/*
		Output:
		null, 18ec681b31ccb42c
	*/
});
```

## Encodings

The `string` option can be an encoding for the `buffer.toString` method.  We do not support `base64`, `utf8` or `utf816le` because the length of the string cannot be verifibly determined due to multibyte character combinations. Supported encodings are:

- `hex`
- `ascii`
