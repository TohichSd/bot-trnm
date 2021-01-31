/**@module tournament */

import DAO from "../../modules/db/index.js"
import {MessageEmbed} from "discord.js"
import winston_logger from "../../modules/logger/index.js";
import dfname from "../../utils/__dfname.js";
import onReactionAdd from "./onReactionAdd.js"
import {readFile} from "fs"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

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
        return new Promise((resolve, reject) => {
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
            (async () => {
                await readFile("bot/config/random_props.json", (err, data) => {
                    let props = JSON.parse(data.toString())
                    Object.entries(props).forEach(([ctg, options]) => {
                        const randomElement = options[Math.floor(Math.random() * options.length)]
                        embed.addField(ctg, randomElement);
                    })
                })
                let event_id = 0
                await DAO.get("SELECT MAX(id) FROM events").then(event => {
                    event_id = parseInt(event['MAX(id)']) + 1
                })
                if (isNaN(event_id)) event_id = 0

                const guild = params.guild
                let guildParams
                await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
                    $guild_id: guild.id
                })
                    .then((row) => {
                        guildParams = row
                    })
                if (!guildParams['tournament_channel'] || !guildParams['applications_channel'])
                    reject("Не установлен канал для турниров или заявок. Для установки напишите !здесь-турниры в канале для турниров и !здесь-заявки в канале для заявок")
                let message
                const channel = guild.channels.cache.get(guildParams["tournament_channel"])
                if(!channel) {
                    reject("Установлен неверный канал для турниров")
                    return
                }
                await channel.send("@everyone")
                await channel.send(embed).then(sentMessage => message = sentMessage)
                DAO.run("INSERT INTO events (name, description, loot, guild_id, message_id, datetimeMs) VALUES ($name, $description, $loot, $guild_id, $message_id, $datetimeMs)", {
                    $name: params.name,
                    $description: params.description,
                    $loot: params.loot,
                    $guild_id: guild.id,
                    $message_id: message.id,
                    $datetimeMs: params.datetimeMs
                })
                logger.info("New tournament: " + event_id)
                message.react(`✅`)
                await onReactionAdd.cache_events()
                resolve()
            })()
        })
    }
}

export default Tournament