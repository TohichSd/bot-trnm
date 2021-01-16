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
<<<<<<< HEAD
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
=======
    for await (let guild of guilds.cache) {
        // logger.info(guild)
        guild = guild[1]
        let event_id = ""
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
        await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
            $guild_id: guild.id
        })
<<<<<<< HEAD
            .then((row) => {
                guildParams = row
=======
        if (event_id === undefined) continue;
        let event = {}
        await DAO.get("SELECT * FROM events WHERE id = $event_id", {
            $event_id: event_id
        }).then(event_row => {
            event = event_row
        })
        if (event === undefined) continue;
        let channelsID = event["channel_id"].split(',')
        logger.info("restartReactionListener:" + event_id)
        for await (let channelID of channelsID) {
            let channel = guild.channels.cache.get(channelID)
            let message
            await channel.messages.fetch(event["message_id"]).then(msg => message = msg)
                .catch((err) => logger.warn(err))
            if(!message) continue
            let channelsToSendID = event["channelsToSendID"].split(',')
            let collector = message.createReactionCollector((reaction) => reaction.emoji.name === `✅`, )
            let feedbackChannel = guild.channels.cache.get(event["feedbackChannel"])
            let member
            collector.on("collect", async (reaction, user) => {
                if (user.bot) return
                let member_id = guild.members.cache.find(member => member.user.id === user.id).id
                //Проверка наличия участника в турнире
                await DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event", {
                    $id: member_id,
                    $guild_id: guild.id,
                    $event: (event_id + 1).toString(),
                }).then(rowMember => {
                    member = rowMember
                })
                //Если участник найден, прекратить
                if (member !== undefined) return
                DAO.get("SELECT * FROM applications WHERE id = $id AND guild_id = $guild_id", {
                    $id: member_id,
                    $guild_id: guild.id,
                }).then(rowApp => {
                    //Иначе добавить участника в турнир
                    if (rowApp === undefined) {
                        feedbackChannel.send("У вас нет заявки! Для создания напишите !заявка.")
                        return
                    }
                    DAO.run("INSERT INTO members (id, guild_id, event) VALUES ($id, $guild_id, $event)", {
                        $id: member_id,
                        $guild_id: guild.id,
                        $event: (event_id + 1).toString()
                    })
                    logger.info("New member")
                    //Послать сообщения об участии в перечисленные каналы
                    for (let channelTSID of channelsToSendID) {
                        let channelM = guild.channels.cache.get(channelTSID)
                        channelM.send(`<@${member_id}> принимает участие в турнире ${event['name']}!\nСсылка на steam: ${rowApp['link']}\nУровень: ${rowApp['level']}\nВозраст: ${rowApp['age']}\nМикрофон: ${rowApp['micro']}`)
                    }
                })
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
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