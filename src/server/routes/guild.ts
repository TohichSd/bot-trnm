import { Router } from 'express'
import Bot from '../../discord/Bot'

const router = Router()

router.get('/guild/:guild_id', async (req, res) => {
    const guild = await Bot.getInstance().getGuild(req.params.guild_id)
    if (!guild) {
        res.status(404).end('Page not found')
        return
    }
    req.session.lastGuild = req.params.guild_id
    res.render('guild', { guild, admin: true, username: req.session.username })
})

export default router
