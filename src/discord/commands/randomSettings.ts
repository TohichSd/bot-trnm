import ICommand from '../classes/ICommand'
import { Message, MessageEmbed } from 'discord.js'
import { Config } from '../../config/BotConfig'

const command: ICommand = {
    name: 'рандом',
    description: 'Случайные настройки для турнира',

    async execute(message: Message) {
        const embed = new MessageEmbed()
        const promises = Config.randomEventOptions.map(ctg => {
            const randomElement = ctg.values[Math.floor(Math.random() * ctg.values.length)]
            embed.addField(ctg.name, randomElement)
            return randomElement
        })
        Promise.all(promises).then(() => {
            message.reply({ embeds: [embed] })
        })
    },
}

export default command