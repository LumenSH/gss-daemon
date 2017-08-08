'use strict';

module.exports = {
    list_tokens: (req, res) => {
        res.ApiResponse.setStatus(true).setData(ioManager.tokens).output();
    },
    create_token: (req, res) => {
        if(req.body.id !== undefined) {
            let token = helper.generateToken();
            ioManager.tokens[token] = {
                server: parseInt(req.body.id),
                created_at: Math.round(new Date().getTime() / 1000)
            };
            res.ApiResponse.setStatus(true).setData(token).output();
        }
    },
    delete_token: (req, res) => {
        if(req.body.token !== undefined) {
            if(ioManager.tokens[req.body.token] !== undefined) {
                delete ioManager.tokens[req.body.token];
                res.ApiResponse.setStatus(true).output();
            }
        }
        res.ApiResponse.output();
    },
};