/**
 * @module restart-reaction-listener
 */
import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"
import tournamentListener from "./reactionListener.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

/**
 * Добавляет слушателей реакций для всех последних сообщений о турнирах для всех серверов
 * @param {object} guilds client.guilds
 */
async function main(guilds) {
    let events
    const time = new Date().getTime();
    await DAO.all("SELECT * FROM events WHERE datetimeMs > $time", {
        $time: time
    })
        .then((row) => {
            events = row
        })
    for (const event of events) {
        //Сервер на котором проходит турнир
        let guild
        await guilds.fetch(event.guild_id)
            .then(g => guild = g)

        //Настройки сервера из бд
        let guildParams
        await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
            $guild_id: guild.id
        })
            .then((row) => {
                guildParams = row
            })

        //Канал, в который было отправлено оповещение о турнире
        let channel = guild.channels.cache.find(c => c.id === event.channel_id)

        //Сообщение с оповещением
        let message
        await channel.messages.fetch(event.message_id)
            .then(m => message = m)

        if(message === undefined) return
        //Время жизни турнира
        const ttl = event.datetimeMs - new Date().getTime()
        setTimeout(() => {
            channel.send("@everyone, Регистрация на турнир завершается через 30 минут!")
        }, ttl - 1800000)
        setTimeout(() => {
            channel.send("@everyone, Регистрация на турнир завершена!")
        }, ttl)

        //Коллектор реакций
        const collector = message.createReactionCollector((reaction) => reaction.emoji.name === `✅`, {time: ttl})
        collector.on("collect", (reaction, user) => {
            tournamentListener(guild, channel, event.id, user, guildParams, event.name)
        })
    }
}

export default {
    name: 'restartReactionListener',
    run: main
}