import mongoose from 'mongoose'
import cachegoose from 'cachegoose'

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

export default clanWarSchema
