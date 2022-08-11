import {
    DocumentType,
    getModelForClass,
    modelOptions,
    prop,
    ReturnModelType,
} from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { collection: 'clans' } })
export class Clan {
    @prop({ required: true })
    public role_id: string

    @prop({ required: true })
    public guild_id: string

    @prop({ required: true, default: 0 })
    public points: number

    @prop()
    public deleted?: boolean

    public static async getAllGuildClans(
        this: ReturnModelType<typeof Clan>,
        guild_id: string
    ): Promise<DocumentType<Clan>[]> {
        return this.find({ guild_id, deleted: { $ne: true } }).exec()
    }

    public static async getClanByRoleID(
        this: ReturnModelType<typeof Clan>,
        role_id: string
    ): Promise<DocumentType<Clan>> {
        return this.findOne({ role_id }).exec()
    }

    public static async removeClanByRoleID(
        this: ReturnModelType<typeof Clan>,
        role_id: string
    ): Promise<unknown> {
        return this.deleteOne({ role_id }).exec()
    }

    public async markDeleted(this: DocumentType<Clan>): Promise<unknown> {
        return this.updateOne({ $set: { deleted: true } })
    }
}

export const ClanModel = getModelForClass(Clan)
