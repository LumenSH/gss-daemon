'use strict';

const spawn = require('child_process').spawn;

class Gameserver {
    constructor(data) {
        this.gameserver = data;
        this.startArguments = JSON.parse(data.startParams);

        this.uid = parseInt(10000 + data.userID);
        this.executableName = data.executable;

        // '/home/user'.$this->getOwner().'/'.$this->gsData['game'].'_'.str_replace('.', '_', $this->gsData['IP']).'_'.$this->gsData['port'].'/'.$dir;
        this.path = '/home/user' + data.userID + "/" + data.internalName + "_" + data.ip.replace(/\./g, '_') + '_' + data.port + '/';

        this.started_at = null;
        this.process = null;
        gameserverManager.logs[this.gameserver.id] = [];
    }
    start() {
        if(this.isRunning()) {
            return false;
        }

        try {
            this.process = spawn(this.executableName, this.startArguments, {
                cwd: this.path,
                uid: this.uid
            });
            this.process.on('error', (err) => {
                this.sendEmit('start-failed', err);
                console.error(`Server ${this.gameserver.id} crashed: ${err.toString()}`);
            });
        } catch(err) {
            this.process = null;
            console.error(`Error starting server ${this.gameserver.id}: ${err.toString()}`);
            return false;
        }
        
        this.process.stdin.setEncoding('utf-8');
        this.process.stdout.setEncoding('utf-8');
        this.started_at = Math.round(new Date().getTime() / 1000);

        this.process.stdout.on('data', (data) => {
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

            delete gameserverManager.servers[this.gameserver.id];
        });

        gameserverManager.servers[this.gameserver.id] = this;
        return true;
    }
    stop() {
        if(this.isRunning()) {
            this.process.kill('SIGHUP');
            setTimeout(() => {
                if(this.process) {
                    this.process.kill('SIGINT');
                }
            }, 10000);
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