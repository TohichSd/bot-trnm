import dfname from "../../utils/__dfname.js"
import winston_logger from "../../modules/logger/index.js"
import DAO from "../../modules/db/index.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

function main(msg) {
    return new Promise((resolve, reject) => {
        const channelID = msg.channel.id
        const guildID = msg.guild.id
        DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
            $guild_id: msg.guild.id
        }).then(result => {
            if(result["hello_channel"] != msg.channel.id) {
                DAO.run("UPDATE guilds SET hello_channel = $channelID WHERE guild_id = $guildID", {
                    $guildID: guildID,
                    $channelID: channelID
                })
                    .then(() => {
                        msg.reply("Канал для приветствий установлен!")
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                        logger.warn(err)
                    })
            }
            else {
                DAO.run("UPDATE guilds SET hello_channel = $channelID WHERE guild_id = $guildID", {
                    $guildID: guildID,
                    $channelID: null
                })
                    .then(() => {
                        msg.reply("Канал для приветствий удалён!")
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                        logger.warn(err)
                    })
            }
        }).catch(err => logger.warn(err))
    })
}

export default {
    run: main,
    name: "здесь-привет",
    permissions: 1,
    description: "Установить канал для заполнения заявок на турниры."
}