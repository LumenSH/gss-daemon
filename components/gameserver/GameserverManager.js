'use strict';

const Gameserver = require('./Gameserver');

class GameserverManager {
    constructor() {
        this.servers = {};
    }
    getServerByID(id) {
        return new Promise((resolve, reject) => {
            if(this.servers[id]) {
                return this.servers[id];
            }
            db.query(
                    "select `gameserver`.`id`, `gameserver`.`gameRootIpID`, `gameserver`.`productID`," +
                    "`gameserver`.`userID`, `gameserver`.`port`, `gameserver`.`startParams`, `products`.`executable`," +
                    "`products`.`internalName`, `gameroot_ip`.`ip`, `users`.`Inhibition` from `gameserver`" +
                    "left join `products` on `products`.`id` = `gameserver`.`productID`" +
                    "left join `gameroot_ip` on `gameroot_ip`.`id` = `gameserver`.`gameRootIpID`" +
                    "left join `users` on `users`.`id` = `gameserver`.`userID`" +
                    "where `gameserver`.`id` = '" + parseInt(id) + "' limit 1",
                { type: Sequelize.QueryTypes.SELECT}).then((s) => {
                    if(s.length > 0) {
                        resolve(new Gameserver(s[0]));
                    } else {
                        reject();
                    }
            }).catch((e) => {
                console.error(`DB Query Error: ${e}`);
            });
        });
    }
}

module.exports = GameserverManager;