/**
 * @module restart-reaction-listener
 */
import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"
import {MessageEmbed} from "discord.js";

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

/**
 * Добавляет слушателей реакций для всех последних сообщений о турнирах для всех серверов
 * @param {object} guilds client.guilds
 */
async function main(guilds) {
    for await (let guild of guilds.cache) {
        // logger.info(guild)
        guild = guild[1]
        let event_id = ""
        await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
            $guild_id: guild.id
        }).then(guild_row => {
            if (guild_row === undefined) return;
            event_id = guild_row["lastEventID"]
        })
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
            if (!message) continue
            let channelsToSendID = event["channelsToSendID"].split(',')
            let collector = message.createReactionCollector((reaction) => reaction.emoji.name === `✅`)
            let feedbackChannel = guild.channels.cache.get(event["feedbackChannel"])
            let member
            collector.on("collect", async (reaction, user) => {
                if (user.bot) return
                let member_id = guild.members.cache.find(member => member.user.id === user.id).id
                let member_name = guild.members.cache.find(member => member.user.id === user.id).displayName
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
                        feedbackChannel.send("У вас нет заявки! Для создания напишите !заявка.").then(mstd => setTimeout(() => mstd.delete(), 7000))
                            .catch((err) => logger.warn(err))
                        return
                    }
                    logger.info("New member")
                    let messagesID = ""
                    //Послать сообщения об участии в перечисленные каналы
                    for (let channelTSID of channelsToSendID) {
                        let channelM = guild.channels.cache.get(channelTSID)
                        let embedNewTournmMember = new MessageEmbed()
                            .setThumbnail("https://i.ibb.co/H4zQ4YB/Check-mark-svg.png")
                            .setTitle(`**Заявка участника ${member_name} на турнир "${event['name']}"**`)
                            .addField(":link: Ссылка на steam:", rowApp['link'])
                            .addField(":video_game: Уровень в игре:", rowApp['level'])
                            .addField(":man_mage: Возраст:", rowApp['age'])
                            .addField(":microphone2: Наличие микрофона:", rowApp['micro'])
                            .setColor("#4287f5")

                        channelM.send(embedNewTournmMember)
                            .then(message => {
                                messagesID += message.id = ","
                            })
                        DAO.run("INSERT INTO members (id, guild_id, event, messagesID) VALUES ($id, $guild_id, $event, $messagesID)", {
                            $id: member_id,
                            $guild_id: guild.id,
                            $event: (event_id + 1).toString(),
                            $messagesID: messagesID
                        })
                    }
                })
            })
        }
    }
}

export default {
    name: 'restartReactionListener',
    run: main
}