'use strict';

const   fs = require('fs'),
        basicAuth = require('basic-auth-connect'),
        express = require('express'),
        bodyParser = require('body-parser'),
        ioManager = require('./socketio'),
        gameserverManager = require('./gameserver/GameserverManager'),
        apiRouter = express.Router(),
        ApiResponseHandler = require('./express/ResponseHelper');

global.app = express()
    .use(bodyParser.json())
    .use(ApiResponseHandler)
    .use(basicAuth(global.config.http.auth.username, global.config.http.auth.password))
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .disable('x-powered-by');

if(global.config.http.ssl.enabled === true) {
    global.server = require('https').createServer({
        cert: fs.readFileSync(global.config.http.ssl.cert),
        key: fs.readFileSync(global.config.http.ssl.key)
    }, app);
} else {
    global.server = require('http').createServer(app);
}

global.ioManager = new ioManager(require('socket.io')(global.server));
global.gameserverManager = new gameserverManager;

let gameserverRoutes = require('./express/routes/gameserver');
let tokenRoutes = require('./express/routes/tokens');

// Routes

// Gameserver
apiRouter.get('/gameserver', gameserverRoutes.list);
apiRouter.get('/gameserver/:id', gameserverRoutes.get);
apiRouter.put('/gameserver/start', gameserverRoutes.start);
apiRouter.delete('/gameserver/stop', gameserverRoutes.stop);

// Tokens
apiRouter.get('/token', tokenRoutes.list_tokens);
apiRouter.post('/token', tokenRoutes.create_token);
apiRouter.delete('/token', tokenRoutes.delete_token);

// Others
apiRouter.get('/monitoring', require('./express/routes/monitoring'));
apiRouter.get(['/', '/heartbeat'], (req, res) => {
    res.Response.setStatus(true).setPayload("heartbeat").output();
});

app.use('/api/v1', apiRouter);
