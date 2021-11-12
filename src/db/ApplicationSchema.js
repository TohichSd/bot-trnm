import cachegoose from 'cachegoose'
import mongoose from 'mongoose'

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

export default applicationSchema
