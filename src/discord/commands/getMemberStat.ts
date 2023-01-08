import ICommand from '../classes/ICommand'
import { GuildMember, Message, MessageEmbed } from 'discord.js'
import { MemberModel } from '../../models/MemberModel'
import { CommandSyntaxError } from '../../classes/CommandErrors'
import { ClanModel } from '../../models/ClanModel'
import { env } from 'process'

const command: ICommand = {
    name: 'стат',
    description: 'Статистика побед и игр участника',
    syntax: '!стат | !стат @участник',

    async execute(message: Message): Promise<void> {
        let member: GuildMember
        if (message.mentions.members.size === 0) member = message.member
        else if (message.mentions.members.size === 1) member = message.mentions.members.first()
        else throw new CommandSyntaxError(this.syntax)

        const clans = await ClanModel.getAllGuildClans(message.guild.id)
        const memberData = await MemberModel.getMemberByID(message.guild.id, member.id)
        if (memberData === null) {
            if (member.id === message.member.id)
                await message.reply('Вы ещё не сыграли ни одной рейтинговой игры!')
            else await message.reply(`У <@${member.id}> ещё нет ни одной сыгранной рейтинговой игры!`)
            return
        }
        const winRate =
            memberData.games !== 0 ? `(${Math.round((memberData.wins / memberData.games) * 100)}%)` : ''
        const statEmbed = new MessageEmbed()
            .setDescription(`Статистика игрока <@${member.id}>`)
            .setColor('#3e76b2')
            .addField(':trophy: Победы:', `${memberData.wins} ${winRate}`)
            .addField(':game_die: Всего игр:', memberData.games.toString())
            .addField(':cyclone: Всего очков:', memberData.points.toString())
        if (member.partial) await member.fetch()
        const memberClan = clans
            .map(clan => {
                if (member.roles.cache.has(clan.role_id)) return clan.role_id
                return undefined
            })
            .filter(id => id)
        if (memberClan.length > 0) statEmbed.addField(':shield: клан:', `<@&${memberClan[0]}>`)

        statEmbed.addField(
            '\u200b',
            `Статистику всех игроков можно посмотреть на сайте сервера ${env.SELF_URL} или командой **!игроки**`
        )
        
        await message.reply({ embeds: [statEmbed] })
    },
}

export default command
