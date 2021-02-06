const PACKAGE = require("./package.json");
const path = require("path");
const webpack = require("webpack");
// const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    mode: 'production',
    entry: {
        main: "./src/main.js",
    },
    output: {
        globalObject: "self",
        filename: "terminal.min.js",
        path: path.resolve(__dirname, "public"),
    },
    module: {
        // rules: [
        //     {
        //         test: /\.js$/,
        //         enforce: 'post',
        //         use: { 
        //             loader: WebpackObfuscator.loader, 
        //             options: {
        //                 rotateStringArray: true
        //             }
        //         }
        //     }
        // ]
    }
};
