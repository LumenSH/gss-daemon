'use strict';

const spawn = require('child_process').spawn;

class Gameserver {
    constructor(data) {
        this.gameserver = data;
        this.gameserver.startParams = JSON.parse(this.gameserver.startParams);

        this.uid = parseInt(10000 + data.userID);
        this.executableName = data.executable;

        this.path = '/home/user' + data.userID + "/" + data.internalName + "_" + data.ip.replace(/\./g, '_') + '_' + data.port + '/';

        this.started_at = null;
        this.process = null;
        if(gameserverManager.logs[this.gameserver.id] === undefined) {
            gameserverManager.logs[this.gameserver.id] = [];
        }
    }
    start() {
        if(this.isRunning()) {
            return false;
        }
        let executeableName = this.path + this.executableName;
        if (this.executableName.substr(0, 1) === '/') {
            executeableName = this.executableName;
        }

        try {
            if(typeof this.gameserver.startParams !== 'object') {
                this.gameserver.startParams = [];
                console.warn(`Warning: No start arguments given for server ${this.gameserver.id} - Using default params!`);
            }
            this.process = spawn(executeableName, this.gameserver.startParams, {
                cwd: this.path,
                uid: this.uid,
                env: {
                    'LD_LIBRARY_PATH': this.path + ':' + this.path + 'bin',
                    'TZ': this.gameserver.timezone || "Europe/Berlin"
                }
            });
            this.process.on('error', (e) => {
                this.sendEmit('start-failed', e);
                console.error(`Server ${this.gameserver.id} crashed: ${e.toString()}`);
            });
        } catch(e) {
            this.process = null;
            Raven.captureException(e);
            console.error(`Error starting server ${this.gameserver.id}: ${e.toString()}`);
            return false;
        }

        this.process.stdin.setEncoding('utf-8');
        this.process.stdout.setEncoding('utf-8');
        this.started_at = Math.round(new Date().getTime() / 1000);
        this.last_log = {time: this.started_at, count: 0};

        global.db.query('UPDATE gameserver SET bannerOn = ?, onlineAt = ? WHERE id = ?', { replacements: [1, new Date().toISOString().substring(0, 10), this.gameserver.id], type: Sequelize.QueryTypes.UPDATE}).catch((err) => {
            console.error(`Error updating bannerOn/onlineAt for gameserver ${this.gameserver.id}: ${err.toString()}`);
        });

        this.process.stdout.on('data', (data) => {
            let timestamp = Math.round(new Date().getTime() / 1000);
            if(this.last_log.time === timestamp) {
                if(this.last_log.count >= 50) {
                    return;
                } else {
                    this.last_log.count += 1;
                }
            } else {
                this.last_log = {time: timestamp, count: 1};
            }

            let string = data.toString() || "";
            this.sendEmit('log', {
                message: string
            });

            gameserverManager.logs[this.gameserver.id].push(string);
            if(gameserverManager.logs[this.gameserver.id].length > 50) {
                gameserverManager.logs[this.gameserver.id].shift();
            }
        });


        this.process.stderr.on('data', (data) => {
            let string = data.toString() || "";

            this.sendEmit('log', {
                message: string
            });

            gameserverManager.logs[this.gameserver.id].push(string);
            if(gameserverManager.logs[this.gameserver.id].length > 50) {
                gameserverManager.logs[this.gameserver.id].shift();
            }
        });

        this.sendEmit('status', {
            status: true
        });

        this.process.on('close', () => {
            this.process = null;
            this.sendEmit('status', {
                status: false
            });

            global.db.query('UPDATE gameserver SET bannerOn = ? WHERE id = ?', { 
                replacements: [0, this.gameserver.id], 
                type: Sequelize.QueryTypes.UPDATE}
            ).catch((err) => {
                console.error(`Error changing bannerOn for gameserver ${this.gameserver.id}: ${err.toString()}`);
            });

            delete gameserverManager.servers[this.gameserver.id];
        });

        gameserverManager.servers[this.gameserver.id] = this;
        return true;
    }
    stop() {
        if(this.isRunning()) {
            this.process.kill('SIGINT');
        }
    }
    isRunning() {
        return !!this.process;
    }
    sendEmit(name, data) {
        if(ioManager.clients[this.gameserver.id] !== undefined) {
            ioManager.clients[this.gameserver.id].forEach((socket) => {
                socket.emit(name, data);
            });
        }
    }
    sendCommand(cmd) {
        if(this.isRunning()) {
            this.process.stdin.write(cmd + "\n");
        }
    }
}

module.exports = Gameserver;
