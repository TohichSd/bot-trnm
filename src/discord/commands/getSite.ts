import { Message } from 'discord.js'
import ICommand from '../classes/ICommand'
import { env } from 'process'

const command: ICommand = {
    name: 'сайт',
    description: 'Сайт бота',
    
    async execute(message: Message) {
        await message.reply(env.SELF_URL)
    }
}

export default command