import { Router } from 'express'
import Bot from '../../discord/Bot'
import { ClanModel } from '../../models/ClanModel'
import { MemberModel } from '../../models/MemberModel'

const router = Router()

router.get('/api/:guild_id/clans/:role_id/members', async (req, res) => {
    const guild = await Bot.getInstance().getGuild(req.params.guild_id)
    const clan = await ClanModel.getClanByRoleID(req.params.role_id)
    if (!clan)
        res.render('error', {
            errorTitle: 'Клан не найден(',
            errorDescription:
                'Возможно вы попытались изменить ссылку или клан был удалён. Попробуйте снова или обратитесь к администрации',
        })
    await guild.members.fetch()
    const role = await guild.roles.fetch(clan.role_id)
    const members = await Promise.all(
        role.members.map(async m => {
            return m.fetch()
        })
    )
    const membersData = await Promise.all(
        members.map(async m => {
            return MemberModel.getMemberByID(req.params.guild_id, m.id)
        })
    )
    res.json(
        members.map((m, i) => {
            return {
                name: m.displayName,
                imageUrl: m.displayAvatarURL(),
                games: membersData[i].games,
                wins: membersData[i].wins,
                points: membersData[i].points,
                id: membersData[i].id
            }
        })
    )
})

export default router