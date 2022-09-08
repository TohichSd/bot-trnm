import { ClanModel } from '../../models/ClanModel'
import Bot from '../Bot'
import { MemberModel } from '../../models/MemberModel'

export default class PointsManager {
    public async editClanPoints(clanRoleID: string, points: number): Promise<void> {
        const clan = await ClanModel.getClanByRoleID(clanRoleID)
        if (!clan) throw new Error('Clan not found')
        await clan.updateOne({ $inc: { points } })
    }

    public async setClanPoints(clanRoleID: string, points: number): Promise<void> {
        const clan = await ClanModel.getClanByRoleID(clanRoleID)
        if (!clan) throw new Error('Clan not found')
        await clan.updateOne({ $set: { points } })
    }

    public async editMemberPoints(
        guildID: string,
        memberID: string,
        points: number
    ): Promise<void> {
        const memberClanRoleID = await Bot.getInstance().getMemberClanRoleID(guildID, memberID)
        if (memberClanRoleID) await this.editClanPoints(memberClanRoleID, points)
        const memberData = await MemberModel.getMemberByID(guildID, memberID)
        await memberData.updateOne({ $inc: { points } })
    }

    public async setMemberPoints(guildID: string, memberID: string, points: number): Promise<void> {
        const memberClanRoleID = await Bot.getInstance().getMemberClanRoleID(guildID, memberID)
        const memberData = await MemberModel.getMemberByID(guildID, memberID)
        if (memberClanRoleID) await this.editClanPoints(memberClanRoleID, points - memberData.points)
        await memberData.updateOne({ $set: { points } })
    }
}
