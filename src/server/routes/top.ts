import { Router } from 'express'
import Bot from '../../discord/Bot'
import { StatusCodes } from 'http-status-codes'

const router = Router()

router.get('/guild/:guild_id/top', async (req, res, next) => {
    const bot = Bot.getInstance()
    const guild = await bot.getGuild(req.params.guild_id)
    if (!guild) {
        next(StatusCodes.NOT_FOUND)
    }
    res.render('top', { guild, username: req.session.username })
})

export default router
