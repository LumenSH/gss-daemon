'use strict';

const pusage = require('pidusage');

module.exports = {
    list: (req, res) => {
        return res.Response.setData(Object.keys(gameserverManager.servers)).output();
    },
    get: (req, res) => {
        if(req.params.id !== undefined) {
            if(gameserverManager.servers[req.params.id] !== undefined) {
                let server = gameserverManager.servers[req.params.id];
                server.usage = {
                    cpu: 0,
                    mem: 0
                };
                pusage.stat(server.process.pid, (err, stat) => {
                    if(!err) {
                        server.usage = {
                            cpu: stat.cpu,
                            mem: helper.byteToMb(stat.memory)
                        };
                    }
                    console.error(`Error while getting PID usage for process ${server.process.pid}: ${err.toString()}`);
                    return res.Response.setData(server).setStatus(true).output();
                });
                pusage.unmonitor(server.process.pid);
                return res.Response.setData(server).setStatus(true).output();
            }
        }
        return res.Response.output();
    },
    start: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.start();
                return res.Response.setStatus(true).output();
            }).catch((err) => {
                console.err(err.stack || err);
            })
        } catch(err) {
            console.err(err.stack || err);
        }
        return res.Response.output();
    },
    stop: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.stop();
                return res.Response.setStatus(true).output();
            }).catch((err) => {
                console.err(err.stack || err);
            })
        } catch(err) {
            console.err(err.stack || err);
        }
        return res.Response.output();
    }
};