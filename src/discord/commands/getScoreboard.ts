import ICommand from '../classes/ICommand'
import { MemberModel } from '../../models/MemberModel'
import { ButtonInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import numberToEmojis from '../util/numberToEmojis'
import { env } from 'process'

const command: ICommand = {
    name: 'топ',
    description: 'Список лучших игроков сервера',

    async execute(inp: Message | ButtonInteraction) {
        let message: Message

        if (inp instanceof Message) message = inp
        else if (inp instanceof ButtonInteraction) message = inp.message as Message

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

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setURL(new URL(`/guild/${message.guild.id}/top/`, env.SELF_URL).href)
                .setLabel('Посмотреть на сайте сервера')
                .setStyle('LINK')
        )

        if (inp instanceof Message) await message.reply({ embeds: [embedMembers], components: [row] })
        else if (inp instanceof ButtonInteraction)
            await inp.reply({ embeds: [embedMembers], components: [row], ephemeral: true })
    },
}

export default command