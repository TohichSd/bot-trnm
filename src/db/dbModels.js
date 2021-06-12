import mongoose from 'mongoose'
import cachegoose from 'cachegoose'

cachegoose(mongoose)

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
  },
  { collection: 'guilds' }
)

guildSchema.statics.findOneByGuildID = function (guild_id) {
  return this.findOne({ guild_id }).cache(1000, `guild${guild_id}`).exec()
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

/**
 * Заявка
 * @type {module:mongoose.Schema<Document, Model<any, any, any>, undefined>}
 */
const applicationSchema = new mongoose.Schema(
  {
    age: {
      type: String,
      required: true,
    },
    guild_id: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    micro: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { collection: 'applications' }
)

applicationSchema.statics.findOneByID = async function (id) {
  return this.findOne({ id }).exec()
}

applicationSchema.methods.updateLevel = function (level) {
  mongoose
    .model('Application')
    .updateOne({ _id: this._id }, { $set: { level } })
}

applicationSchema.methods.updateAge = function (age) {
  mongoose.model('Application').updateOne({ _id: this._id }, { $set: { age } })
}

/**
 * Турнир
 * @type {module:mongoose.Schema<Document, Model<any, any, any>, undefined>}
 */
const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    loot: String,
    datetimeMs: {
      type: Number,
      required: true,
    },
    message_id: String,
    members: [{ id: String, message_id: String }],
    id: Number,
    guild_id: String,
  },
  { collection: 'events' }
)

eventSchema.statics.findOneByMessageID = function (message_id) {
  return this.findOne({ message_id }).exec()
}

eventSchema.statics.findByGuildID = function (guild_id) {
  return this.find({ guild_id }).exec()
}

eventSchema.methods.addMember = function (id, message_id) {
  mongoose
    .model('Event')
    .updateOne({ _id: this._id }, { $push: { members: { id, message_id } } })
    .exec()
}

eventSchema.methods.removeMember = function (id) {
  mongoose
    .model('Event')
    .updateOne({ _id: this._id }, { $pull: { members: { id } } })
    .exec()
}

/**
 * Клан
 * @type {module:mongoose.Schema<Document, Model<any, any, any>, undefined>}
 */
const clanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role_id: {
      type: String,
      required: true,
      unique: true,
    },
    points: Number,
    guild_id: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'clans',
  }
)

clanSchema.statics.removeClanByRole = async function (role_id) {
  return this.deleteOne({ role_id }).exec()
}

clanSchema.statics.getAllGuildClans = async function (guild_id) {
  return this.find({ guild_id }).exec()
}

clanSchema.statics.getClanByRoleID = async function (role_id) {
  return this.findOne({ role_id }).exec()
}

/**
 * @param {Number} points
 * @return {Promise<UpdateWriteOpResult>}
 */
clanSchema.methods.setPoints = async function (points) {
  return mongoose
    .model('Clan')
    .updateOne({ _id: this._id }, { $set: { points } })
    .exec()
}

/**
 * Клановая война
 * @type {module:mongoose.Schema<Document, Model<any, any, any>, undefined>}
 */
const clanWarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    message_id: String,
    created_at: Number,
    guild_id: {
      type: String,
      required: true,
    },
    ended: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'clan_wars',
  }
)

clanWarSchema.methods.end = async function () {
  cachegoose.clearCache('ClanWar')
  await mongoose
    .model('ClanWar')
    .updateOne({ _id: this._id }, { $set: { ended: true } })
    .exec()
}

clanWarSchema.statics.getLatestClanWar = async function (guild_id) {
  return this.findOne({ ended: false, guild_id }, {}, { sort: { created_at: -1 } })
    .cache(1000, 'ClanWar')
    .exec()
}

clanWarSchema.methods.setMessageID = async function (message_id) {
  await mongoose
    .model('ClanWar')
    .updateOne({ _id: this._id }, { message_id })
    .exec()
}

export const GuildModel = mongoose.model('Guild', guildSchema)
export const ApplicationModel = mongoose.model('Application', applicationSchema)
export const EventModel = mongoose.model('Event', eventSchema)
export const ClanModel = mongoose.model('Clan', clanSchema)
export const ClanWarModel = mongoose.model('ClanWar', clanWarSchema)
