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

helper.db.connect();

console.info(`Initialize server daemon..`);
helper.db.init().then(() => {
    helper.listen(global.config.http.port).then(() => {
        console.info(`API is listening on port ${global.config.http.port}`);
        console.info(`Ready to serve some gameservers!`);
        helper.db.checkConnection();
    }).catch((err) => {
        console.error(`Error starting listening on port ${global.config.http.port}: ${err.toString()}`);
        process.exit(1);
    });
}).catch(() => {
    //
});
