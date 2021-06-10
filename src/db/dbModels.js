import mongoose from 'mongoose'

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
    admin_roles: [String],
  },
  { collection: 'guilds', versionKey: false }
)

guildSchema.methods.setApplicationsChannel = function (id) {
  mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { applications_channel: id } })
    .exec()
}

guildSchema.methods.setNewAppChannel = function (id) {
  mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { new_app_channel: id } })
    .exec()
}

guildSchema.methods.setTournamentChannel = function (id) {
  mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $set: { tournament_channel: id } })
    .exec()
}

/**
 * Добавить роли администраторов
 * @param { String[] } IDs
 */
guildSchema.methods.addAdminRole = function (IDs) {
  mongoose
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
  mongoose
    .model('Guild')
    .updateOne({ _id: this._id }, { $pull: { admin_roles: { $in: IDs } } })
    .exec()
}

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
  { collection: 'applications', versionKey: false }
)

applicationSchema.methods.updateLevel = function (level) {
  mongoose
    .model('Application')
    .updateOne({ _id: this._id }, { $set: { level } })
}

applicationSchema.methods.updateAge = function (age) {
  mongoose.model('Application').updateOne({ _id: this._id }, { $set: { age } })
}

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
  { collection: 'events', versionKey: false }
)

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

export const GuildModel = mongoose.model('Guild', guildSchema, 'guilds')
export const ApplicationModel = mongoose.model(
  'Application',
  applicationSchema,
  'applications'
)
export const EventModel = mongoose.model('Event', eventSchema, 'events')
