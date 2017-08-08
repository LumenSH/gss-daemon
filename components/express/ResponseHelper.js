'use strict';

class ResponseHelper {
    constructor(res) {
        this.data = {
            success: false,
            payload: null,
            timestamp: Math.round(new Date().getTime() / 1000),
            version: global.packageConfig.version,
            host_id: global.config.host_id
        };
        this._res = res
    }
    setStatus(bool) {
        this.data.success = bool;
        return this;
    }
    setPayload(payload) {
        this.data.payload = payload;
        return this;
    }
    setData(payload) {
        return this.setPayload(payload);
    }
    output() {
        this._res.json(this.data);
    }
}

module.exports = (req, res, next) => {
    res.ApiResponse = new ResponseHelper(res);
    next();
};