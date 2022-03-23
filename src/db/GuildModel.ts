import {
  modelOptions,
  prop,
  ReturnModelType,
  DocumentType,
  getModelForClass,
} from '@typegoose/typegoose'

/**
 * Представляет параметры каналов сервера
 */
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
}

/**
 * Представляет список лучших игроков
 */
class ScoreTable {
  @prop({ required: true })
  public channel_id!: string

  @prop({ required: true })
  public message_id!: string
}

const ScoreTableModel = getModelForClass(ScoreTable)

class Role {
  @prop({ required: true })
  public role_id!: string

  // Разрешения роли (Config.Permissions)
  @prop({ required: true })
  public permissions!: number
}

@modelOptions({ schemaOptions: { collection: 'guilds' } })
class Guild {
  @prop({ required: true })
  public guild_id!: string

  @prop({ required: true, default: () => ({}) })
  public channels: GuildChannels

  @prop()
  public score_table?: ScoreTable

  @prop({ type: () => [Role] })
  public roles?: Role[]

  public static async findByGuildID(this: ReturnModelType<typeof Guild>, id: string) {
    return this.findOne({ guild_id: id }).exec()
  }

  public async bindScoreTable(this: DocumentType<Guild>, messageID, channelID) {
    return this.updateOne(
      { _id: this._id },
      {
        score_table: new ScoreTableModel({
          message_id: messageID,
          channel_id: channelID,
        }),
      }
    ).exec()
  }
}

export const GuildModel = getModelForClass(Guild)
export const RoleModel = getModelForClass(Role)
