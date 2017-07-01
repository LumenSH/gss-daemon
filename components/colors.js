'use strict';

/*
 https://git.7thplanet.org/gs-panel/gs-panel/blob/develop/components/colors.js
 */

const colors = require('colors');

[
    ['info', 'white'],
    ['log', 'green'],
    ['error', 'red'],
    ['warn', 'yellow'],
].forEach((object) => {
    console['_' + object[0]] = console[object[0]];
console[object[0]] = function() {
    if (typeof arguments[0] !== 'undefined') {
        if (typeof arguments[0] !== 'string') {
            arguments[0] = JSON.stringify(arguments[0], null, 4);
        }

        arguments[0] = new Date().toLocaleString() + ' ' + arguments[0][object[1]];
    }
    return console['_' + object[0]].apply(this, Array.from(arguments));
}
});

// maybe we move this line to another file later, who knows..
console.debug = console._log;