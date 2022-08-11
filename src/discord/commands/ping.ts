import { Message } from 'discord.js'
import ICommand from '../classes/ICommand'

const command: ICommand = {
    name: 'ping',
    aliases: ['пинг'],
    showHelp: false,

    async execute(message: Message): Promise<void> {
        await message.reply('Pong!')
    },
}

export default command
