'use strict';

module.exports = {
    list_tokens: (req, res) => {
        return res.Response.setStatus(true).setData(ioManager.tokens).output();
    },
    create_token: (req, res) => {
        if(req.body.id !== undefined) {
            let token = helper.generateToken();
            ioManager.tokens[token] = {
                server: parseInt(req.body.id),
                created_at: Math.round(new Date().getTime() / 1000)
            };
            return res.Response.setStatus(true).setData(token).output();
        }
        return res.Response.output();
    },
    delete_token: (req, res) => {
        if(req.body.token !== undefined) {
            if(ioManager.tokens[req.body.token] !== undefined) {
                delete ioManager.tokens[req.body.token];
                return res.Response.setStatus(true).output();
            }
        }
        return res.Response.output();
    },
};