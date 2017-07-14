'use strict';

const   fs = require('fs'),
        YAML = require('yamljs');

global.Sequelize = require('sequelize');
global.helper = require('./components/helper');
global.packageConfig = require('./package.json');
global.config = YAML.load('./config.yml');

require('./components/logs');
require('./components/express');

if(global.config === undefined || global.config === false) {
    console.error(`Couldn't parse config.yml file!`);
    process.exit(1);
}

global.db = new Sequelize(global.config.db.dbname, global.config.db.username, global.config.db.password, {
    host: global.config.db.host,
    dialect: "mysql",
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false
    },
    logging: false,
    port: global.config.db.port
});

console.info(`Initialize server daemon..`);
helper.syncDatabase().then(() => {
    global.server.listen(global.config.http.port);
    console.info(`API is listening on port ${global.config.http.port}`);
    console.info(`Ready to serve some gameservers!`);
}).catch((e) => {
    console.error(`Something went wrong while synchronizing the database: ${e.toString()}`);
});
