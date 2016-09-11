var querystring = require('querystring');


console.log(querystring.parse('w=%D6%D0%CE%C4&foo=bar', null, null,
    { decodeURIComponent: true }));
