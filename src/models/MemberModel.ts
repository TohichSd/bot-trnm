import {
    DocumentType,
    getModelForClass,
    modelOptions,
    prop,
    ReturnModelType,
} from '@typegoose/typegoose'
import { Config } from '../config/BotConfig'

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
        guild_id: string
    ): Promise<DocumentType<Member>[]> {
        return this.find({ guild_id, points: { $gt: 0 } })
            .sort({ points: -1 })
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
    private static async getMaxWins() {
        const res: DocumentType<Member>[] = await MemberModel.find({}, { wins: 1, _id: 0 })
            .sort({ wins: -1 })
            .limit(1)
            .exec()
        return res[0].wins
    }

    public async editGamesCount(this: DocumentType<Member>, count: number): Promise<void> {
        this.updateOne({
            $inc: { games: count },
            $set: {
                winIndex: await this.calculateWinIndex(),
            },
        })
    }

    public async editWinsCount(this: DocumentType<Member>, count: number): Promise<void> {
        this.updateOne(
            { _id: this._id },
            {
                $inc: {
                    games: count,
                    wins: count,
                },
                $set: {
                    winIndex: await this.calculateWinIndex(),
                },
            }
        )
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

    private async calculateWinIndex(this: DocumentType<Member>) {
        const maxWins = await Member.getMaxWins()
        return (((2 * this.wins) / maxWins) * this.wins) / this.games
    }
}

const MemberModel = getModelForClass(Member)

export { MemberModel, Member }
