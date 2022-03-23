import { prop, ReturnModelType, getModelForClass, DocumentType } from '@typegoose/typegoose'

class Member {
    @prop({ required: true })
    id: string

    @prop({ required: true })
    guild_id: string

    @prop({ required: true, default: 0, index: true })
    games: number

    @prop({ required: true, default: 0, index: true })
    wins: number

    @prop({ required: true, default: 0, index: true })
    winIndex: number

    public static async getAllGuildMembers(this: ReturnModelType<typeof Member>, guild_id: string) {
        return this.find({ guild_id, games: { $gt: 0 } }).exec()
    }

    public static async getBestGuildMembers(
        this: ReturnModelType<typeof Member>,
        guild_id: string,
        count: number
    ) {
        return this.find({ guild_id, games: { $gt: 0 } })
            .sort({ winIndex: -1 })
            .limit(count)
            .exec()
    }

    public static async findMemberByID(
        this: ReturnModelType<typeof Member>,
        guild_id: string,
        id: string
    ) {
        return this.findOne({ id, guild_id }).exec()
    }

    private async calculateWinIndex(this: DocumentType<Member>) {
        const maxWins = await getMaxWins()
        return (((2 * this.wins) / maxWins) * this.wins) / this.games
    }

    public async editGamesCount(this: DocumentType<Member>, count: number) {
        this.updateOne(
            { _id: this._id },
            {
                $inc: { games: count },
                $set: {
                    winIndex: await this.calculateWinIndex(),
                },
            }
        )
    }

    public async editWinsCount(this: DocumentType<Member>, count: number) {
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
}

const memberModel = getModelForClass(Member, { schemaOptions: { collection: 'members' } })

async function getMaxWins() {
    const res: DocumentType<Member>[] = await memberModel
        .find({}, { wins: 1, _id: 0 })
        .sort({ wins: -1 })
        .limit(1)
        .exec()
    return res[0].wins
}

export default memberModel
