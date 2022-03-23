import ICommand from '../classes/ICommand'
import { GuildMember, Message, MessageEmbed } from 'discord.js'
import ApplicationModel from '../../db/ApplicationModel'
import createApplication from './createApplication'

const command: ICommand = {
    name: 'заявка',
    description: 'Показать заявку участника',

    async execute(message: Message) {
        let member: GuildMember
        if (message.mentions.members.size === 0) member = message.member
        else if (message.mentions.members.size === 1) member = message.mentions.members.first()
        else throw new Error('Invalid command')
        const application = await ApplicationModel.findOneByMemberID(member.id)
        if (!application) {
            if (member.id === message.member.id) {
                await message.reply(
                    `У вас ещё нет заявки, вы можете заполнить её с помощью команды !${createApplication.name}`
                )
                return
            }
        }
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
