'use strict';

const os = require('os');

module.exports = (req, res) => {
    let cpus = os.cpus();
    res.ApiResponse.setStatus(true).setPayload({
        hostname: os.hostname(),
        cpu: {
            loadavg: os.loadavg(),
            architecture: os.arch(),
            model: cpus[0].model,
            cores: cpus.length
        },
        mem: {
            total: helper.byteToMb(os.totalmem()),
            available: helper.byteToMb(os.freemem()),
            in_use: helper.byteToMb(os.totalmem() - os.freemem())
        },
        uptime: {
            daemon: process.uptime().toFixed(0),
            sys: os.uptime().toFixed(0)
        },
        servers: Object.keys(gameserverManager.servers).length,
        tokens: Object.keys(ioManager.tokens).length,
        sockets: Object.keys(ioManager.clients).length
    }).output();
};