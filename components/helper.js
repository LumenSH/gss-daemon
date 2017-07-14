'use strict';

const crypto = require('crypto');

let helper = {
    generateToken: (length) => {
        length = length || 64;
        return crypto.randomBytes(length).toString('hex');
    },
    syncDatabase: () => {
        return global.db.sync();
    },
    byteToMb(bytes) {
        return (bytes/1048576).toFixed(0);
    }
};

module.exports = helper;