import { Message } from 'discord.js'
import ICommand from '../classes/ICommand'
import { CommandError, CommandSyntaxError } from '../../classes/CommandErrors'
import { MemberModel } from '../../models/MemberModel'
import { ClanModel } from '../../models/ClanModel'

const command: ICommand = {
    name: 'очки',
    description: 'Добавить/отнять очки у участника',
    syntax: '!очки @участник +-(число)',

    async execute(message: Message) {
        const args = message.content.replace(/ +(?= )/g, '').split(' ')
        if (message.mentions.members.size != 1 || args.length != 3)
            throw new CommandSyntaxError(this.syntax)
        const points = parseInt(args[2])
        if (!points) throw new CommandSyntaxError(this.syntax)
        const memberData = await MemberModel.getMemberByID(
            message.guild.id,
            message.mentions.members.first().id
        )
        if (message.member.partial) await message.member.fetch()
        const clans = await ClanModel.getAllGuildClans(message.guild.id)
        const memberRoles = message.member.roles.cache.map(role => role.id)
        const clan = clans.filter(c => memberRoles.includes(c.role_id))
        if (clan.length > 1)
            throw new CommandError(
                'Too many clans for one member',
                'Ошибка: У участника должна быть только одна клановая роль!'
            )
        if (args[2].startsWith('+') || args[2].startsWith('-')) {
            await memberData.editPoints(memberData.points + points)
            if (clan.length == 1)
                await clan[0].updateOne({ $set: { points: clan[0].points + points } })
        } else {
            await memberData.editPoints(points)
            if (clan.length == 1)
                await clan[0].updateOne({
                    $set: { points: clan[0].points + points - memberData.points },
                })
        }
        await message.react('✅')
    },
}
export default command
