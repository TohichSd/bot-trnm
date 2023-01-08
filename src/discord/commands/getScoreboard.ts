import ICommand from '../classes/ICommand'
import { MemberModel } from '../../models/MemberModel'
import { MessageEmbed } from 'discord.js'
import numberToEmojis from '../util/numberToEmojis'
import { env } from 'process'

const command: ICommand = {
    name: 'игроки',
    description: 'Список лучших игроков сервера',

    async execute(message) {
        const members = await MemberModel.getBestGuildMembers(message.guild.id, 9)

        const embedMembers = new MessageEmbed()
            .setTitle('Лучшие игроки сервера')
            .setDescription(
                'Не видишь себя? Полный список игроков можно посмотреть на сайте сервера ' + env.SELF_URL
            )
            .setColor('#33ffa0')

        members.forEach((member, place) => {
            let medal
            if (place === 0) medal = ':first_place:'
            else if (place === 1) medal = ':second_place:'
            else if (place === 2) medal = ':third_place:'

            let text =
                (place < 3 ? medal : numberToEmojis(place + 1)) +
                `<@${member.id}>\n` +
                `:trophy: Победы: ${member.wins}\n` +
                `:game_die: Всего игр: ${member.games}\n` +
                `:cyclone: Очков войны: ${member.points}`
            
            if (env.NODE_ENV == 'development') text += `\n${member.winIndex}`

            embedMembers.addField('\u200b', text, true)
        })

        await message.reply({ embeds: [embedMembers] })
    },
}

export default command