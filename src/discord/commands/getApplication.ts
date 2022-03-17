import ICommand from '../classes/ICommand'
import { Message, MessageEmbed } from 'discord.js'
import ApplicationModel from '../../db/applicationSchema'

const command: ICommand = {
    name: 'заявка',
    description: 'Показать заявку участника',

    async execute(message: Message) {
        if (message.mentions.members.size != 1) {
            throw new Error('Invalid command')
        }
        const application = await ApplicationModel.findOneByID(
            message.mentions.members.first().id || message.member.id
        )
        const embed = new MessageEmbed()
            .setTitle(`Заявка участника ${message.member.displayName}`)
            .addField(':link: Ссылка на steam:', application.link)
            .addField(':video_game: Уровень в игре:', application.level)
            .addField(':microphone2: Наличие микрофона:', application.micro)
            .setThumbnail('https://i.ibb.co/1Q7pQ94/podacha.png')
            .setColor('#37bbe0')
        await message.reply({ embeds: [embed] })
    },
}

export default command