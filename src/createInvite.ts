import Bot from './discord/Bot'
import { env, exit } from 'process'

const bot = Bot.getInstance()
bot.init(env.D_TOKEN).then(() => {
    console.log(bot.createInvite())
    exit(0)
})
