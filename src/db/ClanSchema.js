import mongoose from 'mongoose'

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

export default clanSchema
