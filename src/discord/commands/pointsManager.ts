import { Message } from 'discord.js'
import ICommand from '../classes/ICommand'
import { CommandSyntaxError } from '../../classes/CommandErrors'
import { MemberModel } from '../../models/MemberModel'
import { ClanModel } from '../../models/ClanModel'
import Bot from '../Bot'

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
        const memberClanRoleID = await Bot.getInstance().getMemberClanRoleID(
            message.guild.id,
            memberData.id
        )
        const clanData = await ClanModel.getClanByRoleID(memberClanRoleID)
        if (args[2].startsWith('+') || args[2].startsWith('-')) {
            await memberData.editPoints(memberData.points + points)
            await clanData.updateOne({ $set: { points: clanData.points + points } })
        } else {
            await memberData.editPoints(points)
            await clanData.updateOne({
                $set: { points: clanData.points + points - memberData.points },
            })
        }
        await message.react('✅')
    },
}
export default command
