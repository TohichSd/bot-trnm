import { MessageReaction, User } from 'discord.js'
import { GameReportModel } from '../../models/GameReportModel'
import { EventReportModel } from '../../models/EventReportModel'
import { MemberModel } from '../../models/MemberModel'
import { Config } from '../../config/BotConfig'
import Permissions = Config.Permissions
import Bot from '../Bot'

export default class ReportsManager {
    public async onReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
        if (reaction.emoji.name != '✅') return

        const permissions = await Bot.getInstance().getMemberPermissions(
            reaction.message.guild.id,
            user.id
        )
        if (
            !permissions.includes(Permissions.ADMIN) &&
            !permissions.includes(Permissions.ACCEPT_GAME_REPORTS)
        )
            return

        const gameReportsCount = await GameReportModel.countDocuments({
            message_id: reaction.message.id,
            is_accepted: { $ne: true },
        })
        if (gameReportsCount == 1) {
            await this.handleGameReportReaction(reaction)
            return
        }
        const eventReportsCount = await EventReportModel.countDocuments({
            message_id: reaction.message.id,
            is_accepted: { $ne: true },
        })
        if (eventReportsCount == 1) {
            await this.handleEventReportReaction(reaction)
        }
    }

    private async handleGameReportReaction(reaction: MessageReaction) {
        const gameReport = await GameReportModel.findOne({
            message_id: reaction.message.id,
            is_accepted: { $ne: true },
        })
        await Promise.all(
            gameReport.members.map(async id => {
                const member = await MemberModel.getMemberByID(reaction.message.guild.id, id)
                if (id != gameReport.winner) {
                    await member.updateOne({ $inc: { games: 1 } })
                } else {
                    await member.updateOne({
                        $inc: { games: 1, wins: 1 },
                    })
                }
            })
        )
        await gameReport.updateOne({ is_accepted: true })
        const embedReport = reaction.message.embeds[0]
        embedReport.setFooter({ text: 'Очки начислены ✅' })
        await reaction.message.edit({ embeds: [embedReport] })
    }

    private async handleEventReportReaction(reaction: MessageReaction) {
        const eventReport = await EventReportModel.findOne({
            message_id: reaction.message.id,
            is_accepted: { $ne: true },
        })
        await Promise.all(
            eventReport.members.map(async (id, i) => {
                const member = await MemberModel.getMemberByID(reaction.message.guild.id, id)
                await Bot.getInstance()
                    .getPointsManager()
                    .editMemberPoints(reaction.message.guild.id, member.id, eventReport.points[i])
            })
        )
        await eventReport.updateOne({ is_accepted: true })
        const embedReport = reaction.message.embeds[0]
        embedReport.setFooter({ text: 'Очки начислены ✅' })
        
        await reaction.message.edit({ embeds: [embedReport] })
    }
}
