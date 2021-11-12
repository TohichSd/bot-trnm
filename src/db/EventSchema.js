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

export default eventSchema
