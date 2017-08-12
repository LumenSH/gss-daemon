'use strict';

const   os = require('os'),
        si = require('systeminformation');

module.exports = (req, res) => {
    let cpus = os.cpus();
    si.mem((mem_data) => {
        res.ApiResponse.setStatus(true).setPayload({
            hostname: os.hostname(),
            cpu: {
                loadavg: os.loadavg(),
                architecture: os.arch(),
                model: cpus[0].model,
                cores: cpus.length
            },
            mem: {
                total: helper.byteToMb(mem_data.total),
                available: helper.byteToMb(mem_data.free),
                in_use: helper.byteToMb(mem_data.total - mem_data.free)
            },
            uptime: {
                daemon: process.uptime().toFixed(0),
                sys: os.uptime().toFixed(0)
            },
            servers: Object.keys(gameserverManager.servers).length,
            tokens: Object.keys(ioManager.tokens).length,
            sockets: Object.keys(ioManager.clients).length
        }).output();
    });
};