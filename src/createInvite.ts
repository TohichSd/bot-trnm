import Bot from './discord/bot'
import { env, exit } from 'process'

const bot = new Bot()
bot.init(env.D_TOKEN).then(() => {
    console.log(bot.createInvite())
    exit(0)
})
