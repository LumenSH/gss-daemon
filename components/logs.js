'use strict';

/*
 @ref: https://git.7thplanet.org/gs-panel/gs-panel/blob/develop/components/colors.js
 */

const   colors = require('colors'),
        fs  = require('fs');

console.debug = console.log;

process.on('uncaughtException', function (err) {
    console.error(err.stack)
});

[
    ['info', 'white', 'info'],
    ['log', 'green', 'info'],
    ['error', 'red', 'error'],
    ['warn', 'yellow', 'error'],
].forEach((object) => {
    console['_' + object[0]] = console[object[0]];
    console[object[0]] = function() {
        if (typeof arguments[0] !== 'undefined') {
            if (typeof arguments[0] !== 'string') {
                arguments[0] = JSON.stringify(arguments[0], null, 4);
            }
            if (global.config.log.enabled) {
                fs.appendFileSync(global.config.log[object[2]], new Date().toLocaleString() + ' ' + arguments[0] + '\n');
            }
            arguments[0] = new Date().toLocaleString() + ' ' + arguments[0][object[1]];
        }
        return console['_' + object[0]].apply(this, Array.from(arguments));
    }
});

setTimeout(function() {
    console.log(lol());
}, 3000);