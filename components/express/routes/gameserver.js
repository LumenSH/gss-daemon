'use strict';

module.exports = {
    list: (req, res) => {
        return res.Response.setData(Object.keys(gameserverManager.servers)).output();
    },
    get: (req, res) => {
        if(req.params.id !== undefined) {
            if(gameserverManager.servers[req.params.id] !== undefined) {
                return res.Response.setData(gameserverManager.servers[req.params.id]).setStatus(true).output();
            }
        }
        return res.Response.output();
    },
    start: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.start();
            }).catch((error) => {
                console.error(error);
            })
        } catch(error) {
            console.error(error);
        }
        return res.Response.output();
    },
    stop: (req, res) => {
        try {
            gameserverManager.getServerByID(req.body.id).then((server) => {
                server.stop();
            }).catch((error) => {
                console.error(error);
            })
        } catch(error) {
            console.error(error);
        }
        return res.Response.output();
    }
};