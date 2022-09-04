import Bot from './discord/Bot'
import { env, exit } from 'process'
import * as mongoose from 'mongoose'
import CommandsManager from './discord/classes/CommandsManager'
import { join } from 'path'
import { Config } from './config/BotConfig'
import Logger from './classes/Logger'
import Server from './server/Server'

import { readFileSync } from 'fs'

;(async () => {
    await mongoose
        .connect(env.CONNECTION_STRING)
        .then(() => {
            Logger.info('Connected to DB')
        })
        .catch(e => {
            Logger.error(e)
            exit()
        })
    try {
        const server = Server.getInstance()
        await server.loadRoutes(join(__dirname, '/server/routes'))
        if (env.SSL_CERT_PATH && env.SSL_KEY_PATH) {
            server.startHTTPS(
                443,
                readFileSync(env.SSL_KEY_PATH).toString(),
                readFileSync(env.SSL_CERT_PATH).toString()
            )
        } else server.startHTTP(parseInt(env.PORT))

        const commands = await CommandsManager.load(join(__dirname, '/discord/commands'))
        const bot = Bot.getInstance()
        await bot.init(env.D_TOKEN, commands, Config.BotConfig.username)
        console.log('Discord client ready')
    } catch (e) {
        Logger.error(e)
    }
})()
