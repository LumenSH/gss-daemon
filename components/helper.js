'use strict';

const crypto = require('crypto');

let helper = {
    generateToken: (length) => {
        length = length || 64;
        return crypto.randomBytes(length).toString('hex');
    },
    db: {
        init: () => {
            return new Promise((resolve, reject) => {
                console.log(`DB: Connecting to database server ..`);
                helper.db.connect();

                helper.db.syncDatabase().then(() => {
                    resolve();
                }).catch((e) => {
                    console.error(`DB: Error connecting to database server: ${error.toString()}`);
                    reject(e); // proxy error
                })
            });
        },
        connect: () => {
            global.db = new Sequelize(global.config.db.dbname, global.config.db.username, global.config.db.password, {
                host: global.config.db.host,
                port: global.config.db.port,
                dialect: "mysql",
                define: {
                    charset: 'utf8',
                    collate: 'utf8_general_ci',
                    timestamps: false
                },
                logging: false,
            });
        },
        syncDatabase: () => {
            return global.db.sync();
        },
        checkConnection: () => {
            if (global.db) {
                global.db.authenticate().catch((error) => {
                    console.error(`DB: Lost connection to database server: ${error.toString()}`);
                    setTimeout(() => {
                        helper.db.init();
                    }, 10000);
                }).then(() => {
                    setTimeout(helper.db.checkConnection, 30000);
                });
            } else {
                setTimeout(helper.db.checkConnection, 10000);
            }
        }
    },
    byteToMb(bytes) {
        return parseInt((bytes/1048576).toFixed(0));
    },
    listen: (port) => {
        return new Promise((resolve, reject) => {
            if (global.server) {
                global.server.listen(port, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });
    }
};

module.exports = helper;