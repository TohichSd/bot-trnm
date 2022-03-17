import Bot from './discord/bot'
import { env } from 'process'
import * as mongoose from 'mongoose'

;(async () => {
    await mongoose
        .connect(env.CONNECTION_STRING)
    
    const bot = new Bot()
    await bot.init(env.D_TOKEN, 'test-bot')
})()
