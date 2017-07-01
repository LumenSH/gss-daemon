'use strict';

const   fs = require('fs'),
        basicAuth = require('basic-auth-connect'),
        express = require('express'),
        bodyParser = require('body-parser'),
        ioManager = require('../socketio'),
        gameserverManager = require('../gameserver/GameserverManager'),
        apiRouter = express.Router(),
        ApiResponseHandler = require('./ResponseHelper');

global.app = express();
if(global.config.http.ssl.enabled === true) {
    global.server = require('http').createServer({
        cert: fs.readFileSync(global.config.http.ssl.cert),
        key: fs.readFileSync(global.config.http.ssl.key)
    }, app);
} else {
    global.server = require('http').createServer(app);
}

global.ioManager = new ioManager(require('socket.io')(global.server));
global.gameserverManager = new gameserverManager;

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(ApiResponseHandler);
app.use(basicAuth(global.config.http.auth.username, global.config.http.auth.password));
app.use(bodyParser.urlencoded({
    extended: true
}));

let gameserverRoutes = require('./routes/gameserver');
let tokenRoutes = require('./routes/tokens');

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
apiRouter.get('/monitoring', require('./routes/monitoring'));
apiRouter.get(['/', '/heartbeat'], (req, res) => {
    res.Response.setStatus(true).setPayload("heartbeat").output();
});

app.use('/api/v1', apiRouter);
