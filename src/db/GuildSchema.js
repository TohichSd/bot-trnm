import mongoose from 'mongoose'
import cachegoose from 'cachegoose'

/**
 * Сервер
 * @type {module:mongoose.Schema<Document, Model<any, any, any>, undefined>}
 */
const guildSchema = new mongoose.Schema(
  {
    guild_id: {
      type: String,
      required: true,
    },
    applications_channel: String,
    hello_channel: String,
    new_app_channel: String,
    tournament_channel: String,
    clan_wars_channel: String,
    admin_roles: [String],
    score_table_channel: String,
    score_table_message_id: String,
  },
  { collection: 'guilds' }
)

guildSchema.statics.findOneByGuildID = function (guild_id) {
  return this.findOne({ guild_id }).cache(0, `guild${guild_id}`).exec()
}

guildSchema.methods.setApplicationsChannel = async function (id) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { applications_channel: id } })
    .exec()
}

guildSchema.methods.setNewAppChannel = async function (id) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { new_app_channel: id } })
    .exec()
}

guildSchema.methods.setTournamentChannel = async function (id) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { tournament_channel: id } })
    .exec()
}

guildSchema.methods.setClanWarsChannel = async function (id) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { clan_wars_channel: id } })
    .exec()
}

guildSchema.methods.setClanWarsChannel = async function (id) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { clan_wars_channel: id } })
    .exec()
}

guildSchema.methods.setScoreTableChannel = async function (id) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { score_table_channel: id } })
    .exec()
}

guildSchema.methods.setScoreTableMessageID = async function (id) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { score_table_message_id: id } })
    .exec()
}

/**
 * Добавить роли администраторов
 * @param { String[] } IDs
 */
guildSchema.methods.addAdminRole = async function (IDs) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  await mongoose
    .model('Guild')
    .updateOne(
      { _id: this._id },
      { $addToSet: { admin_roles: { $each: IDs } } }
    )
    .exec()
}

/**
 * Удалить роли администраторов
 * @param { String[] } IDs
 */
guildSchema.methods.removeAdminRole = function (IDs) {
  cachegoose.clearCache(`guild${this.guild_id}`)
  mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $pull: { admin_roles: { $in: IDs } } })
    .exec()
}

export default guildSchema
