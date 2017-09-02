'use strict';

const Gameserver = require('./Gameserver');

class GameserverManager {
    constructor() {
        this.servers = {};
        this.logs = {};
    }
    getServerByID(id) {
        return new Promise((resolve, reject) => {
            if(this.servers[id]) {
                resolve(this.servers[id]);
            }
            db.query(
                    "select `gameserver`.`id`, `gameserver`.`gameRootIpID`, `gameserver`.`productID`," +
                    "`gameserver`.`userID`, `gameserver`.`port`, `gameserver`.`startParams`, `products`.`executable`," +
                    "`products`.`internalName`, `gameroot_ip`.`ip`, `users`.`Inhibition`, `users`.`Inhibition`, `users`.`timezone` from `gameserver`" +
                    "left join `products` on `products`.`id` = `gameserver`.`productID`" +
                    "left join `gameroot_ip` on `gameroot_ip`.`id` = `gameserver`.`gameRootIpID`" +
                    "left join `users` on `users`.`id` = `gameserver`.`userID`" +
                    "where `gameserver`.`id` = '?' AND `gameserver`.`gameRootID` = '?' limit 1",
                { replacements: [id, config.host_id], type: Sequelize.QueryTypes.SELECT}).then((s) => {
                    if(s.length > 0) {
                        resolve(new Gameserver(s[0]));
                    } else {
                        reject(new Error('Cant find server with ID ' + id));
                    }
            }).catch((e) => {
                Raven.captureException(e);
                console.error(`DB Query Error: ${e}`);
                reject(new Error("DB Query Error"));
            });
        });
    }
}

module.exports = GameserverManager;
