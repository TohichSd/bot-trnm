import { Router } from 'express'
import { MemberModel } from '../../models/MemberModel'
import Bot from '../../discord/Bot'

const router = Router()

router.get('/api/:guild_id/member/:member_id', async (req, res) => {
    const bot = Bot.getInstance()
    const memberData = await MemberModel.getMemberByID(req.params.guild_id, req.params.member_id)
    const memberDiscordData = await bot.getMemberByID(req.params.guild_id, req.params.member_id)
    if (!memberDiscordData) {
        res.status(400).json({ error: 'user not found' })
        return
    }
    res.json({
        id: memberData.id,
        games: memberData.games,
        wins: memberData.wins,
        points: memberData.points,
        name: memberDiscordData.displayName,
    })
})

export default router
