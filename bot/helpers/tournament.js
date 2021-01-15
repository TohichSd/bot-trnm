/**@module tournament */
import DAO from "../../modules/db/index.js"
import {
    MessageEmbed
} from "discord.js"
import winston_logger from "../../modules/logger/index.js";
import dfname from "../../utils/__dfname.js";

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

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
     * @param {object} params.guild Сервер
     * @params {number} params.datetimeMs
     */
    constructor(params = {
        name: "",
        description: "",
        imgURL: "",
        loot: "",
        date: "",
        guild: {},
        region: "",
        datetimeMs: 0
    }) {
        //Получить id последнего турнира из бд
        //создание embed-сообщения
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
        let event_id = 0
        DAO.get("SELECT MAX(id) FROM events").then(event => {
            event_id = parseInt(event['MAX(id)'])
        })


        ;(async () => {
            const guild = params.guild
            let guildParams
            await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
                $guild_id: guild.id
            })
                .then((row) => {
                    guildParams = row
                })

            let message
            let channel = guild.channels.cache.get(guildParams["tournament_channel"])
            await channel.send(embed).then(sentMessage => message = sentMessage)
            message.react(`✅`)
            let collector = message.createReactionCollector((reaction) => reaction.emoji.name === `✅`)
            collector.on("collect", async (reaction, user) => {
                if (user.bot) return

                //Найти участника в guild.members.cache
                let member = channel.guild.members.cache.find(member => member.user.id === user.id)

                //Найти участника в списке турнира
                let memberData
                await DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event", {
                    $id: member.id,
                    $guild_id: guild.id,
                    $event: (event_id + 1).toString(),
                }).then(rowMember => {
                    memberData = rowMember
                })

                //Если участник найден, прекратить
                if (memberData !== undefined) return

                //Иначе получить заявку из бд
                let application
                await DAO.get("SELECT * FROM applications WHERE id = $id AND guild_id = $guild_id", {
                    $id: member.id,
                    $guild_id: guild.id
                }).then(rowApp => {
                    application = rowApp
                })

                //Если у участника нет заявки
                if (application === undefined) {
                    channel.send("У вас нет заявки! Для создания напишите !заявка.").then(mstd => setTimeout(() => mstd.delete(), 7000))
                        .catch((err) => logger.warn(err))
                    return
                }

                //Канал для отправки заявок
                let applicationsChannel = guild.channels.cache.get(guildParams["applications_channel"])
                //Сообщение о заявке

                let embedNewTournmMember = new MessageEmbed()
                    .setThumbnail("https://i.ibb.co/H4zQ4YB/Check-mark-svg.png")
                    .setTitle(`**Заявка участника ${member.displayName} на турнир "${params.name}"**`)
                    .addField(":link: Ссылка на steam:", application['link'])
                    .addField(":video_game: Уровень в игре:", application['level'])
                    .addField(":man_mage: Возраст:", application['age'])
                    .addField(":microphone2: Наличие микрофона:", application['micro'])
                    .setColor("#4287f5")

                //Отправить заявку участника
                applicationsChannel.send(embedNewTournmMember)

                //Добавить участника в базу данных
                DAO.run("INSERT INTO members (id, guild_id, event) VALUES ($id, $guild_id, $event)", {
                    $id: member.id,
                    $guild_id: guild.id,
                    $event: (event_id + 1).toString()
                })
                    .catch(error => logger.warn(error))

                //Добавить турнир в бзу данных
                DAO.run("INSERT INTO events (name, description, loot, message_id, channel_id, channelsToSendID, datetime-ms) VALUES ($name, $description, $loot, $message_id, $channel_id, $channelsToSendID, $datetimeMs)", {
                    $name: params.name,
                    $description: params.description,
                    $loot: params.loot,
                    $message_id: message.id,
                    $channel_id: channel.id,
                    $datetimeMs: params.datetimeMs
                })
            })
        })()
    }
}

export default Tournament