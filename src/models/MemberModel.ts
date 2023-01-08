import {
    DocumentType,
    getModelForClass,
    modelOptions,
    prop,
    ReturnModelType,
} from '@typegoose/typegoose'
import { Config } from '../config/BotConfig'
import * as NodeCache from 'node-cache'

const cache = new NodeCache()

@modelOptions({ schemaOptions: { collection: 'members' } })
class Member {
    @prop({ required: true })
    public id: string

    @prop({ required: true })
    public guild_id: string

    @prop({ required: true, default: 0, index: true })
    public games: number

    @prop({ required: true, default: 0, index: true })
    public wins: number

    @prop({ required: true, default: 0, index: true })
    public winIndex: number

    @prop({ required: true, default: 0, index: true })
    public points: number

    @prop()
    public permissions: string[]

    // заявка
    @prop()
    public link: string

    @prop()
    public level: string

    @prop()
    public micro: string

    public static async getAllGuildMembers(
        this: ReturnModelType<typeof Member>,
        guild_id: string
    ): Promise<DocumentType<Member>[]> {
        return this.find({ guild_id }).exec()
    }

    public static async getBestGuildMembers(
        this: ReturnModelType<typeof Member>,
        guild_id: string,
        limit?: number
    ): Promise<DocumentType<Member>[]> {
        if (limit)
            return this.find({ guild_id, games: { $gt: 0 }, wins: { $gt: 0 } })
                .sort({
                    winIndex: -1,
                    points: -1,
                })
                .limit(limit)
                .exec()
        else
            return this.find({ guild_id, games: { $gt: 0 }, wins: { $gt: 0 } })
                .sort({
                    winIndex: -1,
                    points: -1,
                })
                .exec()
    }

    /**
     * Возвращает участника или создаёт новую запись
     * @param guild_id
     * @param id
     */
    public static async getMemberByID(
        this: ReturnModelType<typeof Member>,
        guild_id: string,
        id: string
    ): Promise<DocumentType<Member>> {
        const memberData = await this.findOne({ id, guild_id }).exec()
        if (!memberData) {
            const newMember = new MemberModel({ id, guild_id })
            await newMember.save()
            return newMember
        }
        return memberData
    }

    // Максимальное количество побед среди всех участников
    private static async getMaxWins(guildID) {
        let res: DocumentType<Member>[]
        if (!cache.get<number>(`mw${guildID}`)) {
            res = await MemberModel.find({ guild_id: guildID }, { wins: 1, _id: 0 })
                .sort({ wins: -1 })
                .limit(1)
                .exec()
            cache.set<number>(`mw${guildID}`, res[0].wins || 0)
            return res[0].wins
        } else return cache.get<number>(`mw${guildID}`)
    }

    public static async updateGuildWinIndexes(guildID: string): Promise<void> {
        const maxWins = await Member.getMaxWins(guildID)
        const members = await MemberModel.find({ guild_id: guildID })
        await Promise.all(
            members.map(async m => {
                m.winIndex = m.calculateWinIndex(maxWins)
                await m.save()
            })
        )
    }

    public async editGamesCount(this: DocumentType<Member>, count: number): Promise<void> {
        const maxWins = await Member.getMaxWins(this.guild_id)
        this.updateOne({
            $inc: { games: count },
            $set: {
                winIndex: this.calculateWinIndex(maxWins),
            },
        })
    }

    public async editWinsCount(this: DocumentType<Member>, count: number): Promise<void> {
        const maxWins = await Member.getMaxWins(this.guild_id)
        await this.updateOne({
            $inc: {
                games: count,
                wins: count,
            },
        }).exec()
        if (this.wins > maxWins) {
            cache.del(`mw${this.guild_id}`)
            await Member.updateGuildWinIndexes(this.guild_id)
        }
    }

    public async setPermissions(
        this: DocumentType<Member>,
        permissions: Config.Permissions[]
    ): Promise<unknown> {
        return this.updateOne({ $set: { permissions } }).exec()
    }

    public async editPoints(this: DocumentType<Member>, points: number): Promise<unknown> {
        return this.updateOne({ $set: { points } }).exec()
    }

    private calculateWinIndex(this: DocumentType<Member>, maxWins: number) {
        if (this.games == 0 || !this.games) return 0
        return (((2 * this.wins) / maxWins) * this.wins) / this.games
    }
}


const MemberModel = getModelForClass(Member)

export { MemberModel, Member }
