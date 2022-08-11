import { DocumentType, getModelForClass, modelOptions, prop, ReturnModelType } from '@typegoose/typegoose'

/**
 * Представляет параметры каналов сервера
 */
@modelOptions({ schemaOptions: { _id: false } })
class GuildChannels {
    @prop()
    public applications_channel?: string

    @prop()
    public new_app_channel?: string

    @prop()
    public tournament_channel?: string

    @prop()
    public clan_wars_channel?: string

    @prop()
    public game_report_channel?: string

    @prop()
    public game_report_images_channel?: string

    @prop()
    public logs_channel?: string
    
    @prop()
    public notifications_channel?: string
}



@modelOptions({ schemaOptions: { collection: 'guilds' } })
export class Guild {
    @prop({ required: true })
    public guild_id!: string

    @prop({ required: true, default: () => ({}) })
    public channels: GuildChannels

    @prop({ required: true, default: () => 2 })
    public static async getByGuildID(this: ReturnModelType<typeof Guild>, id: string): Promise<DocumentType<Guild>> {
        return this.findOne({ guild_id: id }).exec()
    }
}

export const GuildModel = getModelForClass(Guild)
