'use strict';

class SocketIO {
    constructor(io) {
        io.set('origins', '*:*');

        this.clients = {};
        this.tokens = {};
        io.on('connection', (socket) => {
            try {
                socket.gameserverID = null;
                socket.on('login', (data) => {
                    if (data.key !== undefined && this.tokens[data.key] !== undefined) {
                        socket.token = this.tokens[data.key];
                        socket.gameserverID = this.tokens[data.key].server;
                        delete this.tokens[data.key];

                        if (this.clients[socket.gameserverID] === undefined) {
                            this.clients[socket.gameserverID] = [];
                        }
                        this.clients[socket.gameserverID].push(socket);

                        if(gameserverManager.logs[socket.gameserverID] !== undefined) {
                            gameserverManager.logs[socket.gameserverID].forEach((log) => {
                                socket.emit('log', {
                                    message: log
                                });
                            });
                        }

                        return this.registerEvents(socket);
                    }
                    return socket.disconnect();
                });
                socket.on('disconnect', () => {
                    try {
                        if (socket.gameserverID) {
                            delete this.clients[socket.gameserverID];
                        }
                    } catch(e) {
                        Raven.captureException(e);
                        console.error(e.stack || e);
                    }
                    
                });
            } catch(e) {
                Raven.captureException(e);
                console.error(`Error while authenticating from client ${socket.handshake.address.address}: ${e.toString()}`);
            }
        });
    }
    registerEvents(socket) {
        socket.on('start', () => {
            gameserverManager.getServerByID(socket.gameserverID).then((server) => {
                if(server) {
                    server.start();
                }
            }).catch((e) => {
                Raven.captureException(e);
                console.error(`Couldn't start server ${socket.gameserverID} (requested by user): ${e.toString()}`);
            });
        });
        socket.on('stop', () => {
            if(gameserverManager.servers[socket.gameserverID]) {
                try {
                    gameserverManager.servers[socket.gameserverID].stop();
                } catch(e) {
                    Raven.captureException(e);
                    console.error(`Error stopping server ${socket.gameserverID}: ${e.toString()}`)
                }
            }
        });
        socket.on('command', (socketData) => {
            try {
                if(gameserverManager.servers[socket.gameserverID]) {
                    if(socketData.message !== undefined) {
                        gameserverManager.servers[socket.gameserverID].sendCommand(socketData.message.toString());
                    }
                }
            } catch(e) {
                Raven.captureException(e);
                console.error(`Error emitting server status ${socket.gameserverID}: ${e.toString()}`)
            }
        });
        socket.on('status', () => {
            try {
                if(gameserverManager.servers[socket.gameserverID] !== undefined) {
                    socket.emit('status', {
                        status: gameserverManager.servers[socket.gameserverID].isRunning()
                    });
                } else {
                    socket.emit('status', {
                        status: false
                    });
                }
            } catch(e) {
                Raven.captureException(e);
                console.error(`Error emitting server status ${socket.gameserverID}: ${e.toString()}`)
            }
        });
        socket.on('log', () => {
            try {
                if(gameserverManager.logs[socket.gameserverID] !== undefined) {
                    gameserverManager.logs[socket.gameserverID].forEach((log) => {
                        socket.emit('log', {
                            message: log
                        });
                    });
                }
            } catch(e) {
                Raven.captureException(e);
                console.error(`Error while fetching logs for server ${socket.gameserverID}: ${e.toString()}`);
            }
        });
    }
}

module.exports = SocketIO;