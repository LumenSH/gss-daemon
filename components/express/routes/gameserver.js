'use strict';

const pusage = require('pidusage');

module.exports = {
    list: (req, res) => {
        return res.ApiResponse.setData(Object.keys(gameserverManager.servers)).output();
    },
    get: (req, res) => {
        try {
            if(req.params.id !== undefined) {
                if(gameserverManager.servers[req.params.id] !== undefined) {
                    let server = gameserverManager.servers[req.params.id];
                    if (server.isRunning()) {
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
                            if (!err) {
                                data.usage = {
                                    cpu: stat.cpu,
                                    mem: helper.byteToMb(stat.memory)
                                };
                            } else {
                                console.error(`Error while getting PID usage for process ${server.process.pid} (Server ${server.gameserver.id}): ${err.toString()}`);
                            }
                            res.ApiResponse.setData(data).setStatus(true).output();
                        });
                        pusage.unmonitor(server.process.pid);
                    } else {
                        res.ApiResponse.setStatus(false).output();
                    }
                } else {
                    res.ApiResponse.setStatus(false).output();
                }
            }
        } catch(e) {
            Raven.captureException(e);
            console.error(e.stack || e);
        }
    },
    start: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.start();
                res.ApiResponse.setStatus(true).output();
            }).catch((e) => {
                console.error(e.stack || e);
            })
        } catch(e) {
            Raven.captureException(e);
            console.error(e.stack || e);
        }
    },
    stop: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.stop();
                res.ApiResponse.setStatus(true).output();
            }).catch((e) => {
		        res.ApiResponse.setStatus(false).output();
                console.error(e.stack || e);
            })
        } catch(e) {
            Raven.captureException(e);
            res.ApiResponse.setStatus(false).output();
            console.error(e.stack || e);
        }
    },
    clear_logs: (req, res) => {
        try {
            if(gameserverManager.logs[req.body.id] !== undefined) {
                gameserverManager.logs[req.body.id] = [];
                res.ApiResponse.setStatus(true).output();
            }
        } catch(e) {
            Raven.captureException(e);
            console.error(e.stack || e);
        }
    }
};
