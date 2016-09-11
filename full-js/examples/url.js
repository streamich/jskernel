var url = require('url');


// console.log(url);
console.log(url.parse('https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost'));
console.log(url.format(url.parse('https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost')));
console.log(url.resolve('/one/two/three', 'four'));
