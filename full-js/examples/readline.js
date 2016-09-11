var readline = require('readline');


// var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// rl.question('What do you think of Node.js? ', function(answer) {
//     TODO: Log the answer in a database
    // console.log('Thank you for your valuable feedback:', answer);
    //
    // rl.close();
// });


// console.log(process.stdin._readableState);

process.stdin.on('data', function(a) {
    process.stdin.pause();
    console.log(a.toString());
    // console.log('here');
    // console.log(process.stdin._readableState.flowing);

});