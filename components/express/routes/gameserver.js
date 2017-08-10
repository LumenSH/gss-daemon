'use strict';

const pusage = require('pidusage');

module.exports = {
    list: (req, res) => {
        return res.ApiResponse.setData(Object.keys(gameserverManager.servers)).output();
    },
    get: (req, res) => {
        if(req.params.id !== undefined) {
            if(gameserverManager.servers[req.params.id] !== undefined) {
                let server = gameserverManager.servers[req.params.id];
                let data = {
                    id: server.gameserver.id,
                    userID: server.gameserver.userID,
                    uid: server.uid,
                    path: server.path,
                    gameserver: server.gameserver,
                    usage: {
                        mem: 0,
                        cpu: 0,
                    },
                    pid: server.process.pid,
                    started_at: server.started_at
                };
                pusage.stat(server.process.pid, (err, stat) => {
                    if(!err) {
                        data.usage = {
                            cpu: stat.cpu,
                            mem: helper.byteToMb(stat.memory)
                        };
                    } else {
                        console.error(`Error while getting PID usage for process ${server.process.pid}: ${err.toString()}`);
                    }
                    res.ApiResponse.setData(data).setStatus(true).output();
                });
                pusage.unmonitor(server.process.pid);
            }
        }
    },
    start: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.start();
                res.ApiResponse.setStatus(true).output();
            }).catch((err) => {
                console.error(err.stack || err);
            })
        } catch(err) {
            console.error(err.stack || err);
        }
    },
    stop: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.stop();
                res.ApiResponse.setStatus(true).output();
            }).catch((err) => {
                console.error(err.stack || err);
            })
        } catch(err) {
            console.error(err.stack || err);
        }
    },
    clear_logs: (req, res) => {
        try {
            if(gameserverManager.logs[req.body.id] !== undefined) {
                gameserverManager.logs[req.body.id] = [];
                res.ApiResponse.setStatus(true).output();
            }
        } catch(err) {
            console.error(err.stack || err);
        }
    }
};