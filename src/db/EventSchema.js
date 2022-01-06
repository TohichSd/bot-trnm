import mongoose from 'mongoose'
import cachegoose from 'cachegoose'

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
    // ID сообдения о турнире
    message_id: String,
    // ID собщения со списком участников
    message_apps_id: String,
    // ID роли турнира (участник турнира ...)
    event_role_id: String,
    // Учасники турнира
    members: [{id: String}],
    // ID турнира в бд
    id: Number,
    guild_id: String,
    isRandom: Boolean
  },
  {collection: 'events'}
)

eventSchema.statics.findOneByMessageID = function (message_id) {
  return this.findOne({message_id}).cache(0, `event${this.id}`).exec()
}

eventSchema.statics.findByGuildID = function (guild_id) {
  return this.find({guild_id}).sort({datetimeMs: -1}).cache(0, `events`).exec()
}

eventSchema.statics.createEvent = async function (doc) {
  cachegoose.clearCache('events')
  return this.create(doc)
}

eventSchema.methods.addMember = async function (id) {
  await cachegoose.clearCache(`event${this.id}`)
  return mongoose
    .model('Event')
    .findByIdAndUpdate(this._id, {$push: {members: {id}}}, {new: true})
    .exec()
}

eventSchema.methods.removeMember = async function (id) {
  await cachegoose.clearCache(`event${this.id}`)
  return mongoose
    .model('Event')
    .findByIdAndUpdate(this._id, {$pull: {members: {id}}}, {new: true})
    .exec()
}

eventSchema.methods.update = async function (doc) {
  await cachegoose.clearCache(`event${this.id}`)
  return mongoose
    .model('Event')
    .findByIdAndUpdate(this._id, {$set: doc})
    .exec()
}

export default eventSchema
