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

/**
 * Заявка
 * @type {module:mongoose.Schema<Document, Model<any, any, any>, undefined>}
 */
const applicationSchema = new mongoose.Schema(
  {
    age: {
      type: String,
      required: false,
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
  return this.findOne({ id }).cache(0, `application/${id}`).exec()
}

applicationSchema.methods.updateLevel = async function (level) {
  cachegoose.clearCache(`application/${this.id}`)
  await mongoose
    .model('Application')
    .updateOne({ _id: this._id }, { $set: { level } })
    .exec()
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
    message_apps_id: String,
    event_role_id: String,
    members: [{ id: String }],
    id: Number,
    guild_id: String,
  },
  { collection: 'events' }
)

eventSchema.statics.findOneByMessageID = function (message_id) {
  return this.findOne({ message_id }).cache(0, `event${this.id}`).exec()
}

eventSchema.statics.findByGuildID = function (guild_id) {
  return this.find({ guild_id }).cache(0, `event${this.id}`).exec()
}

eventSchema.methods.addMember = async function (id) {
  await cachegoose.clearCache(`event${this.id}`)
  return mongoose
    .model('Event')
    .findByIdAndUpdate(this._id, { $push: { members: { id } } }, { new: true })
    .exec()
}

eventSchema.methods.removeMember = async function (id) {
  await cachegoose.clearCache(`event${this.id}`)
  return mongoose
    .model('Event')
    .findByIdAndUpdate(this._id, { $pull: { members: { id } } }, { new: true })
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
  return this.findOne(
    { ended: false, guild_id },
    {},
    { sort: { created_at: -1 } }
  )
    .cache(1000, 'ClanWar')
    .exec()
}

clanWarSchema.methods.setMessageID = async function (message_id) {
  await mongoose
    .model('ClanWar')
    .updateOne({ _id: this._id }, { message_id })
    .exec()
}

const memberSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    guild_id: {
      type: String,
      required: true,
    },
    games: {
      type: Number,
      required: true,
      default: 0,
    },
    wins: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    collection: 'members',
  }
)

memberSchema.statics.getAllGuildMembers = async function (guild_id) {
  return this.find({ guild_id, games: { $gt: 0 } }).sort({ wins: 1 }).exec()
}

memberSchema.statics.findMemberByID = async function (id, guild_id) {
  return this.findOne({ id, guild_id, games: { $gt: 0 } }).cache(`member${id}${guild_id}`).exec()
}

memberSchema.methods.editGamesCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  await mongoose
    .model('Member')
    .updateOne({ _id: this._id }, { $inc: { games: count } })
    .exec()
}

memberSchema.methods.editWinsCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  await mongoose
    .model('Member')
    .updateOne({ _id: this._id }, { $inc: { games: count, wins: count } })
    .exec()
}

memberSchema.methods.setGamesCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  await mongoose
    .model('Member')
    .updateOne({ _id: this._id }, { $set: { games: count } })
    .exec()
}

memberSchema.methods.setWinsCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  await mongoose
    .model('Member')
    .updateOne({ _id: this._id }, { $set: { wins: count } })
    .exec()
}

export const GuildModel = mongoose.model('Guild', guildSchema)
export const ApplicationModel = mongoose.model('Application', applicationSchema)
export const EventModel = mongoose.model('Event', eventSchema)
export const ClanModel = mongoose.model('Clan', clanSchema)
export const ClanWarModel = mongoose.model('ClanWar', clanWarSchema)
export const MemberModel = mongoose.model('Member', memberSchema)
