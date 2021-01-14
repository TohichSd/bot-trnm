import dfname from "../../utils/__dfname.js"
import winston_logger from "../../modules/logger/index.js"
import DAO from "../../modules/db/index.js"
const logger = new winston_logger(dfname.dirfilename(import.meta.url))

function main(msg) {
    msg.delete()
    return new Promise((resolve, reject) => {
        const channelID = msg.channel.id
        const guildID = msg.guild.id
        DAO.run("UPDATE guilds SET tournament_channel = $channelID WHERE guild_id = $guildID", {
            $guildID: guildID,
            $channelID: channelID
        })
            .then(() => {
                msg.reply("Канал для турниров установлен!")
                resolve()
            })
            .catch((err) => {
                reject(err)
                logger.warn(err)
            })
    })
}

export default {
    run: main,
    name: "здесь-турниры",
    permissions: 1,
    description: "Установить канал для объявлений о турнирах"
}