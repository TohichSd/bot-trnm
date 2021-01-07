/**@module tournament */
import DAO from "../../modules/db/index.js"
import {
    MessageEmbed
} from "discord.js"
import winston_logger from "../../modules/logger/index.js";
import dfname from "../../utils/__dfname.js";
const logger = new winston_logger(dfname.dirfilename(import.meta.url))

import {env} from "process"
// console.log = function() {}
// console.error = function() {}
/**
 * Класс турнира
 */
class Tournament {
    /**
     * Новый турнир
     * @param {string} params.description Описание турнирах
     * @param {object[]} params.channels Каналы, в которые будут отправлены сообщения о турнире
     * @param {string} params.imgURL url картинке для embed
     * @param {string} params.loot Награды
     */
    constructor(params = {
        name: "",
        description: "",
        channelsTrnm: {},
        channelsMembers: {},
        imgURL: "",
        loot: "",
        date: "",
        guild_id: "",
        feedbackChannel: {},
        region: ""
    }) {
        //Получить id последнего турнира из бд
        //создание embed-сообщения
        if (params.channelsTrnm.size === 0 || params.channelsMembers.size === 0) {
            params.feedbackChannel.send("Я же просил использовать #упоминания! Давай по новой.")
            return
        }
        let embed = new MessageEmbed()
        if (params.region !== "russia") {
            embed
                .setColor('#18d94b')
                .setTitle("**" + params.name.toUpperCase() + "**")
                .setDescription(":point_right: New tournament is coming :point_left:")
                .addField(":fire: DESCRIPTION :fire: ", params.description)
                .addField(":first_place: AWARDS :first_place: ", params.loot)
                .addField(":clock1: Date and time :clock1:", params.date)
                .setAuthor("NEW TOURNAMENT", "https://cdn.discordapp.com/app-icons/788856250854277140/5b104ef35a2f808c899de065d92809f4.png?size=512")
                .setImage(params.imgURL)
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
                .setImage(params.imgURL)
                .setFooter("Жми на галочку чтобы принять участие")
                .setThumbnail("https://i.postimg.cc/L8grKJQV/exclamation-mark.png")
        }
        let messages = ""
        let channels = ""
        let event_id = 0;
        let member;
        DAO.get("SELECT MAX(id) FROM events").then(event => {
            event_id = parseInt(event['MAX(id)'])
        })
        ;(async () => {
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
                $name: params.name,
                $description: params.description,
                $loot: params.loot,
                $message_id: messages.slice(0, messages.length - 1),
                $channel_id: channels.slice(0, channels.length - 1),
                $channelsToSendID: channelsToSendID.slice(0, channelsToSendID.length - 1),
                $feedbackChannel: params.feedbackChannel.id
            })
            //Обновить последние сообщения и каналы в guilds
            DAO.run("UPDATE guilds SET lastEventID = $event_id WHERE guild_id = $guild_id", {
                $guild_id: params.guild_id,
                $event_id: (event_id + 1).toString()
            })
            // params.feedbackChannel.send("Турнир создан")
        })()
    }


}

export default Tournament