/**
 * @module bot
 */

import Discord from "discord.js"
import winston_logger from "../modules/logger/index.js"
import dfname from "../utils/__dfname.js"
import commands from "./commands/index.js"
import helpers from "./helpers/index.js"
import {
    env
} from "process"

const prefix = '!'
const logger = new winston_logger(dfname.dirfilename(
    import.meta.url), true)
const client = new Discord.Client()
let isCmdRunning = []
client.login(env.DSTOKEN)

client.on('ready', () => {
    logger.info("Discord client ready")
    helpers.restartReactionListener.run(client.guilds)
})
console.log = function() {}
// client.on('guildCreate', (newGuild) => {
//     // helpers.init.run(newGuild)
// })

/**
 * Событие при обнаружении сообщения
 */
client.on('message', async (message) => {
    if(env.ONLYGUILD_ID && message.guild.id !== env.ONLYGUILD_ID) return;
    if (message.author.bot) return;
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
            let cmd = message.content.slice(1).split(' ')[0]
            if (commands[cmd]) {
                if (role >= commands[cmd].permissions || commands[cmd].permissions === undefined) {
                    commands[cmd].run(message, role)
                        .then(() => isCmdRunning.splice(isCmdRunning.indexOf(message.member.id), 1))
                        .catch((err) => {
                                message.channel.send("Произошла непредвиденная ошибка.")
                                logger.error(err)
                        })
                    isCmdRunning.push(message.member.id)
                } else
                    message.reply("Эту команду могдут выполнить только администраторы")
            }
            // } else
            //     message.reply("Нет такой команды! Все команды - !help")
        })
        .catch((err) => {
            logger.error(err)
        })
})