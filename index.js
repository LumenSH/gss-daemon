'use strict';

const   fs = require('fs'),
        YAML = require('yamljs');

global.Sequelize = require('sequelize');
global.helper = require('./components/helper');
global.packageConfig = require('./package.json');
global.config = YAML.load('./config.yml');
global.Raven = require('raven');

Raven.config('https://71b6342deb6b4021b3e07537ccf5c1b5:3b2fe73d88fd4f88b77ec068a27c381d@sentry.shyim.de/12').install(); 

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
