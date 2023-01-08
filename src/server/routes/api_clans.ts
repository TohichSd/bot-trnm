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
            if (m.partial)
                return m.fetch()
            return m
        })
    )
    const membersData = await Promise.all(
        members.map(async m => {
            const memberData = await MemberModel.getMemberByID(req.params.guild_id, m.id)
            return {
                name: m.displayName,
                id: m.id,
                imageUrl: m.displayAvatarURL(),
                games: memberData.games,
                wins: memberData.wins,
                points: memberData.points,
            }
        })
    )
    
    res.json(
        membersData.sort((m1, m2) => m2.points - m1.points).map((m, i) => {
            return {
                name: m.name,
                imageUrl: m.imageUrl,
                games: membersData[i].games,
                wins: membersData[i].wins,
                points: membersData[i].points,
                id: membersData[i].id
            }
        })
    )
})

export default router