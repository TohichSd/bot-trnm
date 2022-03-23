import ICommand from '../classes/ICommand'
import { GuildMember, Message, MessageEmbed } from 'discord.js'
import memberModel from '../../db/MemberModel'
import { CommandSyntaxError } from '../classes/CommandErrors'

const command: ICommand = {
    name: 'стат',
    description: 'Статистика побед и игр участника',
    syntax: '!стат | !стат @участник',

    async execute(message: Message): Promise<void> {
        let member: GuildMember
        if (message.mentions.members.size === 0) member = message.member
        else if (message.mentions.members.size === 1) member = message.mentions.members.first()
        else throw new CommandSyntaxError(this.syntax)
        const memberData = await memberModel.findMemberByID(message.guild.id, member.id)
        if (memberData === null) {
            if (member.id === message.member.id)
                await message.reply('Вы ещё не сыграли ни одной рейтиноговой игры!')
            else
                await message.reply(
                    `У <@${member.id}> ещё нет ни одной сыгранной рейтинговой игры!`
                )
            return
        }
        const winRate =
            memberData.games !== 0
                ? `(${Math.round((memberData.wins / memberData.games) * 100)}%)`
                : ''
        const statEmbed = new MessageEmbed()
            .setDescription(`Статистика игрока <@${member.id}>`)
            .setColor('#3e76b2')
            .addField(':trophy: Победы:', `${memberData.wins} ${winRate}`)
            .addField(':game_die: Всего игр:', memberData.games.toString())
        await message.reply({ embeds: [statEmbed] })
    },
}

export default command
