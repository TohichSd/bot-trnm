import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js";
import dfname from "../../utils/__dfname.js";

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

/**
 * Вызвать при удалении реакции на сообщение с турниром
 * @param reaction реакция
 * @param user пользовательЮ добавивший реакцию
 * @returns {Promise<void>}
 */
async function main(reaction, user) {
    if (reaction.message.partial) await reaction.message.fetch()
    //Получить информацию о турнире из бд
    let event
    await DAO.get("SELECT * FROM events WHERE message_id = $message_id", {
        $message_id: reaction.message.id
    })
        .then(result => event = result)
    //Если турнир не найден
    if (!event) return
    //Получить информацию об участнике турнира из бд
    let member
    await DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event_id", {
        $id: user.id,
        $guild_id: reaction.message.guild.id,
        $event_id: event.id
    })
        .then(result => member = result)
    //Если участник не найден
    if (!member) throw "OnReactionRemove: no such event member"
    //Удалить запись об участии из бд
    await DAO.run("DELETE FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event_id", {
        $id: user.id,
        $guild_id: reaction.message.guild.id,
        $event_id: event.id
    })
    //Получить информацию о серврере из бд
    let guildParams
    await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
        $guild_id: reaction.message.guild.id
    })
        .then(result => guildParams = result)
    //Получить канал с сообщением об участии
    const member_channel = reaction.message.guild.channels.cache.find(c => c.id === guildParams.applications_channel)
    //Получить сообщение об участии
    await member_channel.messages.fetch(member.message_id)
        //Удалить сообщение
        .then(message => message.delete())
        .catch(err => logger.warn(err))
    logger.info("Deleted member from event " + event.id)
}


export default {
    name: 'onReactionRemove',
    run: main
}