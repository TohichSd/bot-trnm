import { Router } from 'express'
import Bot from '../../discord/Bot'
import { ClanModel } from '../../models/ClanModel'
import Logger from '../../classes/Logger'

const router = Router()

router.get('/guild/:guild_id/clans', async (req, res) => {
    const guild = await Bot.getInstance().getGuild(req.params.guild_id)
    const clans = await ClanModel.getAllGuildClans(req.params.guild_id)
    const discordGuildData = await Bot.getInstance().getGuild(req.params.guild_id)
    res.render('clans', {
        guild,
        admin: true,
        clans: await Promise.all(
            clans.map(async clan => {
                if (discordGuildData.roles.cache.has(clan.role_id))
                    await discordGuildData.roles.fetch(clan.role_id)
                let roleName: string
                try {
                    roleName = discordGuildData.roles.cache.get(clan.role_id).name
                } catch (e) {
                    roleName = '[Роль недоступна]'
                    Logger.warn('Cannot find role ' + clan.role_id)
                }
                return {
                    name: roleName,
                    points: clan.points,
                    role_id: clan.role_id,
                }
            })
        ),
        username: req.session.username,
    })
})

export default router
