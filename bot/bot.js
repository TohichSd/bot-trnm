/**
 * @module bot
 */

import Discord from "discord.js"
import winston_logger from "../modules/logger/index.js"
import dfname from "../utils/__dfname.js"
import commands from "./commands/index.js"
import helpers from "./helpers/index.js"
import {env} from "process"
import server from "../server/server.js"

const prefix = '!'
const logger = new winston_logger(dfname.dirfilename(
    import.meta.url), true)
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
let isCmdRunning = []
client.login(env.DSTOKEN)

client.on('ready', () => {
    logger.info("Discord client ready")
    server(client)
})
client.on('guildCreate', (newGuild) => {
    helpers.init.run(newGuild)
})

/**
 * Событие при обнаружении сообщения
 */
client.on('message', async (message) => {
    if(env.ONLYGUILD_ID && message.guild.id !== env.ONLYGUILD_ID) return;
    if (message.author.bot) return;
    //Функция дебила отключена
    // helpers.debil.run(message)
    if (!message.content.startsWith(prefix)) return
    if (isCmdRunning.indexOf(message.member.id) !== -1) return;
    helpers.permissions.get(message.guild.id, message.member.id)
        .then(row => {
            let role
            if (row[0])
                role = row[0]["role"]
            else if (message.member.user.id === "542733341011738639")
                role = 2
            else
                role = 0
            logger.info(`Новая команда: ${message.content}`)
            let cmd = message.content.slice(1).split(' ')[0].toLowerCase()
            if (commands[cmd]) {
                if (role >= commands[cmd].permissions || commands[cmd].permissions === undefined) {
                    commands[cmd].run(message, role)
                        .then(() => isCmdRunning.splice(isCmdRunning.indexOf(message.member.id), 1))
                        .catch((err) => {
                                logger.error(err)
                            isCmdRunning.splice(isCmdRunning.indexOf(message.member.id), 1)
                        })
                    isCmdRunning.push(message.member.id)
                } else
                    message.reply("Ваших прав не достаточно для выполнения этой команды.")
            }
            // } else
            //     message.reply("Нет такой команды! Все команды - !help")
        })
        .catch((err) => {
            logger.error(err)
        })
})

client.on('messageReactionAdd', (reaction, user) => {
    helpers.onReactionAdd.run(reaction, user)
})