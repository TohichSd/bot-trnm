/**@module tournament */
import DAO from "../../modules/db/index.js"
import {
    MessageEmbed
} from "discord.js"
import winston_logger from "../../modules/logger/index.js";
import dfname from "../../utils/__dfname.js";
<<<<<<< HEAD
import tournamentListener from "./reactionListener.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

=======
const logger = new winston_logger(dfname.dirfilename(import.meta.url))

import {env} from "process"
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
// console.log = function() {}
// console.error = function() {}
/**
 * Класс турнира
 */
class Tournament {
    /**
     * Новый турнир
     * @param {string} params.name Название турнира
     * @param {string} params.description Описание турнира
     * @param {object[]} params.channels Каналы, в которые будут отправлены сообщения о турнире
     * @param {string} params.loot Награды
     * @param {object} params.guild Сервер
     * @params {number} params.datetimeMs
     */
    constructor(params = {
        name: "",
        description: "",
        loot: "",
        date: "",
        guild: {},
        region: "",
        datetimeMs: 0
    }) {
        //Получить id последнего турнира из бд
        //создание embed-сообщения
        let embed = new MessageEmbed()
        if (params.guild.region !== "russia") {
            embed
                .setColor('#18d94b')
                .setTitle("**" + params.name.toUpperCase() + "**")
                .setDescription(":point_right: New tournament is coming :point_left:")
                .addField(":fire: DESCRIPTION :fire: ", params.description)
                .addField(":first_place: AWARDS :first_place: ", params.loot)
                .addField(":clock1: Date and time :clock1:", params.date)
                .setAuthor("NEW TOURNAMENT", "https://cdn.discordapp.com/app-icons/788856250854277140/5b104ef35a2f808c899de065d92809f4.png?size=512")
                .setImage("https://img.pngio.com/fileunknown-infobox-image-tournamentpng-call-of-duty-esports-tournament-png-700_700.png")
                .setFooter("Click on the checkbox to take part")
                .setThumbnail("https://i.postimg.cc/L8grKJQV/exclamation-mark.png")
        } else {
            embed
                .setColor('#18d94b')
                .setTitle("**" + params.name.toUpperCase() + "**")
                .setDescription(":point_right: На сервере скоро состоится новый турнир! :point_left:")
                .addField(":fire: ОПИСАНИЕ :fire: ", params.description)
                .addField(":first_place: НАГРАДЫ :first_place: ", params.loot)
                .addField(":clock1: ВРЕМЯ ПРОВЕДЕНИЯ :clock1:", params.date)
                .setAuthor("НОВЫЙ ТУРНИР", "https://cdn.discordapp.com/app-icons/788856250854277140/5b104ef35a2f808c899de065d92809f4.png?size=512")
                .setImage("https://img.pngio.com/fileunknown-infobox-image-tournamentpng-call-of-duty-esports-tournament-png-700_700.png")
                .setFooter("Жми на галочку чтобы принять участие")
                .setThumbnail("https://i.postimg.cc/L8grKJQV/exclamation-mark.png")
        }
        let event_id = 0
        DAO.get("SELECT MAX(id) FROM events").then(event => {
            event_id = parseInt(event['MAX(id)'])
        })
        if(isNaN(event_id)) event_id = 0
        ;(async () => {
<<<<<<< HEAD
            const guild = params.guild
            let guildParams
            await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
                $guild_id: guild.id
            })
                .then((row) => {
                    guildParams = row
                })

            let message
            const channel = guild.channels.cache.get(guildParams["tournament_channel"])
            await channel.send("@everyone")
            await channel.send(embed).then(sentMessage => message = sentMessage)
            DAO.run("INSERT INTO events (name, description, loot, guild_id, message_id, channel_id, datetimeMs) VALUES ($name, $description, $loot, $guild_id, $message_id, $channel_id, $datetimeMs)", {
=======
            for (let channel of params.channelsTrnm) {
                channel = channel[1]
                await channel.send(embed)
                    .then(async (message) => {
                        messages += message.id + ','
                        channels += message.channel.id + ','
                        message.react("✅")
                        let collector = message.createReactionCollector((reaction) => reaction.emoji.name === `✅`)
                        //При добавлении эмодзи, выполнить следующее
                        await collector.on("collect", async (reaction, user) => {

                            if (user.bot) return
                            let member_id = channel.guild.members.cache.find(member => member.user.id === user.id).id
                            //Проверка наличия участника в турнире
                            await DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event", {
                                $id: member_id,
                                $guild_id: params.guild_id,
                                $event: (event_id + 1).toString(),
                            }).then(rowMember => {
                                member = rowMember
                            })
                            //Если участник найден, прекратить
                            if (member !== undefined) return
                            DAO.get("SELECT * FROM applications WHERE id = $id AND guild_id = $guild_id", {
                                $id: member_id,
                                $guild_id: params.guild_id,
                            }).then(rowApp => {
                                //Иначе добавить участника в турнир
                                if (rowApp === undefined) {
                                    params.feedbackChannel.send("У вас нет заявки! Для создания напишите !заявка.").then(mstd => setTimeout(mstd.delete()),7000)
                                    return
                                }
                                let messagesID = ""
                                //Послать сообщения об участии в перечисленные каналы
                                for (let channelM of params.channelsMembers) {
                                    channelM = channelM[1]
                                    channelM.send(`<@${member_id}> принимает участие в турнире ${params.name}!\nСсылка на steam: ${rowApp['link']}\nУровень: ${rowApp['level']}\nВозраст: ${rowApp['age']}\nМикрофон: ${rowApp['micro']}`)
                                        .then(message => {
                                            messagesID += message.id = ","
                                        })
                                }
                                logger.info("New member")
                                DAO.run("INSERT INTO members (id, guild_id, event, messagesID) VALUES ($id, $guild_id, $event, $messagesID)", {
                                    $id: member_id,
                                    $guild_id: params.guild_id,
                                    $event: (event_id + 1).toString(),
                                    $messagesID: messagesID
                                })
                            })
                        })
                        await collector.on("remove", (reaction, user) => {
                            let member_id = channel.guild.members.cache.find(member => member.user.id === user.id).id
                            DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event", {
                                $id: member_id,
                                $guild_id: params.guild_id,
                                $event: (event_id + 1).toString(),
                            }).then(rowMember => {
                                let memberMessagesID = rowMember["messagesID"].split(',')
                                for (let mmID of memberMessagesID) {
                                    // let message =
                                }
                            })
                        })
                    })
            }
            //создать запись о турнире в бд
            let channelsToSendID = ""
            for (let channelM of params.channelsMembers) {
                channelM = channelM[1]
                channelsToSendID += channelM.id + ','
            }
            DAO.run("INSERT INTO events (name, description, loot, message_id, channel_id, channelsToSendID, feedbackChannel) VALUES ($name, $description, $loot, $message_id, $channel_id, $channelsToSendID, $feedbackChannel)", {
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
                $name: params.name,
                $description: params.description,
                $loot: params.loot,
                $guild_id: guild.id,
                $message_id: message.id,
                $channel_id: channel.id,
                $datetimeMs: params.datetimeMs
            })
            logger.info("New tournament: " + event_id)
            const ttl = params.datetimeMs - new Date().getTime()
            setTimeout(() => {
                channel.send("@everyone, Регистрация на турнир завершается через 30 минут!")
            }, ttl - 1800000)
            setTimeout(() => {
                channel.send("@everyone, Регистрация на турнир завершена!")
            }, ttl)
            message.react(`✅`)
            const collector = message.createReactionCollector((reaction) => reaction.emoji.name === `✅`, {time: ttl})
            collector.on("collect", (reaction, user) => {
                tournamentListener(guild, channel, event_id, user, guildParams, params.name)
            })
        })()
    }
}

export default Tournament