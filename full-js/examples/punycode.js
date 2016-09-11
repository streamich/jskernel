var punycode = require('punycode');


console.log(punycode.encode('mañana')); // 'maana-pta'
console.log(punycode.encode('☃-⌘')); // '--dqo34k'