import { MessageReaction } from 'discord.js'
import { GameReportModel } from '../../models/GameReportModel'
import { EventReportModel } from '../../models/EventReportModel'
import { MemberModel } from '../../models/MemberModel'
import { Config } from '../../config/BotConfig'
import POINTS = Config.POINTS
import Bot from '../Bot'
import { ClanModel } from '../../models/ClanModel'

export default class ReportsManager {
    public async onReactionAdd(reaction: MessageReaction): Promise<void> {
        if (reaction.emoji.name != '✅') return
        const gameReport = await GameReportModel.findOne({
            message_id: reaction.message.id,
            is_accepted: { $ne: true },
        })
        if (gameReport) {
            await Promise.all(
                gameReport.members.map(async id => {
                    const member = await MemberModel.getMemberByID(reaction.message.guild.id, id)
                    const memberClanRoleID = await Bot.getInstance().getMemberClanRoleID(
                        reaction.message.guild.id,
                        id
                    )
                    const clanData = await ClanModel.getClanByRoleID(memberClanRoleID)
                    if (id != gameReport.winner) {
                        await member.editPoints(POINTS.R_GAME)
                        if (clanData)
                            await clanData.updateOne({ $inc: { points: POINTS.R_GAME, games: 1 } })
                    } else {
                        await member.editPoints(POINTS.R_GAME_WIN)
                        if (clanData)
                            await clanData.updateOne({
                                $inc: { points: POINTS.R_GAME_WIN, games: 1, wins: 1 },
                            })
                    }
                })
            )
            await MemberModel.updateOne(
                { id: gameReport.winner },
                { $inc: { points: POINTS.R_GAME_WIN } }
            )
            await gameReport.updateOne({ is_accepted: true })
            const embedReport = reaction.message.embeds[0]
            embedReport.setFooter({ text: 'Очки начислены ✅' })
            await reaction.message.edit({ embeds: [embedReport] })
            return
        }
        const eventReport = await EventReportModel.findOne({
            message_id: reaction.message.id,
            is_accepted: { $ne: true },
        })
        if (eventReport) {
            await Promise.all(
                eventReport.members.map(async (id, i) => {
                    const member = await MemberModel.getMemberByID(reaction.message.guild.id, id)
                    const memberClanRoleID = await Bot.getInstance().getMemberClanRoleID(
                        reaction.message.guild.id,
                        id
                    )
                    const clanData = await ClanModel.getClanByRoleID(memberClanRoleID)
                    if (clanData)
                        await clanData.updateOne({ $inc: { points: eventReport.points[i] } })
                    await member.editPoints(eventReport.points[i])
                })
            )
            await eventReport.updateOne({ is_accepted: true })
            const embedReport = reaction.message.embeds[0]
            embedReport.setFooter({ text: 'Очки начислены ✅' })
        }
    }
}
