import Bot from '../../discord/Bot'
import { MemberModel } from '../../models/MemberModel'
import { Router } from 'express'
import Logger from '../../classes/Logger'

const router = Router()

router.get('/api/:guild_id/top', async (req, res) => {
    const bot = Bot.getInstance()
    try {
        const membersData = await MemberModel.getBestGuildMembers(req.params.guild_id)
        const IDs = membersData.map(mData => mData.id)
        const membersDiscordData = await bot.getMembersByIDs(req.params.guild_id, IDs)
        if (!membersDiscordData) {
            res.json({ error: 'Error while fetching members data' })
        }

        res.json(
            membersData
                .filter(member => membersDiscordData.has(member.id))
                .sort((a, b) => b.points - a.points)
                .map(member => {
                    return {
                        id: member.id,
                        games: member.games,
                        wins: member.wins,
                        points: member.points,
                        name: membersDiscordData.get(member.id).displayName,
                        imageUrl: membersDiscordData.get(member.id).displayAvatarURL(),
                    }
                })
        )
    } catch (e) {
        Logger.error(e)
    }
})

export default router
