"use strict";
var path = require('path');
// Overwrite implemented functionality.
require('./lib/unode');
// Run file.
var file = process.argv[2];
if (!file) {
    console.error('Please provide file.');
    process.exit();
}
if (!path.isAbsolute(file)) {
    file = process.cwd() + path.sep + file;
    file = path.normalize(file);
}
require(file);
