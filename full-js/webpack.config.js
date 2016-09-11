var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var WrapperPlugin = require('wrapper-webpack-plugin');


var globals_plugin = new webpack.DefinePlugin({
    // DEBUG mode
    __DEBUG__: JSON.stringify(JSON.parse(process.env.BUILD_DEBUG || true)),

    // Whether to trace syscalls.
    __STRACE__: JSON.stringify(JSON.parse(process.env.BUILD_STRACE || true)),

    // `console.log()` will not print to terminal if `true`.
    __STRACE_BLOCK_STDOUT__: JSON.stringify(JSON.parse(process.env.BUILD_STRACE_BLOCK_STDOUT || false)),

    // Whether to create a thread pool to make async syscall function.
    __BUILD_ASYNC_SYSCALL__: JSON.stringify(JSON.parse(process.env.BUILD_BUILD_ASYNCSYSCALL || true)),
});


module.exports = {
    entry: {
        app: './src/index'
    },
    output: {
        path: './dist',
        filename: 'full.js'
    },
    resolve: {
        extensions: ['.js']
    },
    target: 'node',                 // in order to ignore built-in modules like path, fs, etc.
    // externals: [nodeExternals()]    // in order to ignore all modules in node_modules folder

    plugins: [
        new WrapperPlugin({
            header: 'global = this;\n',
            footer: ''
        }),
        globals_plugin
    ]
};
