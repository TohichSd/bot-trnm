import Bot from './discord/bot'
import { env } from 'process'
import * as mongoose from 'mongoose'
import CommandsLoader from './discord/classes/commandsLoader'
import { join } from 'path'
import { Config } from "./config/BotConfig"

(async () => {
    await mongoose
        .connect(env.CONNECTION_STRING)
    
    const commands = await CommandsLoader.load(join(__dirname, '/discord/commands'))
    const bot = new Bot()
    await bot.init(env.D_TOKEN, commands, Config.Bot.username)
    console.log('Discord client ready')
})()
