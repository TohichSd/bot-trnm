import { Router } from 'express'
import Bot from '../../discord/Bot'

const router = Router()

router.get('/', async (req, res) => {
    if (req.query.reset == '1') req.session.lastGuild = undefined
    if (req.session.lastGuild) {
        res.redirect('/guild/' + req.session.lastGuild + '/')
        return
    }
    const guilds = await Bot.getInstance().getAllGuilds()
    if (guilds.length === 1) {
        res.redirect('/' + guilds[0].id + '/')
        return
    }
    res.render('chooseGuild', { guilds, username: req.session.username })
})

export default router
