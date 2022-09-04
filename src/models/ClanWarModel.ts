import { modelOptions, prop, ReturnModelType, DocumentType, getModelForClass } from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { collection: 'clan_wars' } })
export class ClanWar {
    @prop({ required: true })
    public guild_id: string

    @prop({ required: true })
    public name: string

    @prop({ required: true })
    public duration: string
    
    @prop({ required: true })
    public imageUrl: string

    @prop({ required: true })
    public message_id: string

    @prop({ required: true })
    public created_at: number

    @prop({ required: true, default: false })
    public ended: boolean

    public static async getLatestClanWar(
        this: ReturnModelType<typeof ClanWar>,
        guild_id: string
    ): Promise<DocumentType<ClanWar>> {
        return this.findOne({ ended: false, guild_id }, {}, { sort: { created_at: -1 } }).exec()
    }
}

export const ClanWarModel = getModelForClass(ClanWar)