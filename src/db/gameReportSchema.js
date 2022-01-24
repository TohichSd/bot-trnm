import mongoose from 'mongoose'

const gameReportSchema = new mongoose.Schema(
  {
    // ID автора
    author: {
      required: true,
      type: String,
    },
    // ID учатсников (включая победителя)
    members: {
      required: true,
      type: [String],
    },
    datetimeMs: {
      required: true,
      type: Number,
    },
    // ID победителя
    winner: {
      required: true,
      type: String,
    },
    message_id: String,
    is_accepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'game_reports',
  }
)

gameReportSchema.statics.findOneByMessageID = async function (message_id) {
  return this.findOne({ message_id }).exec()
}

gameReportSchema.methods.accept = async function () {
  await mongoose
    .model('GameReport')
    .updateOne({ _id: this._id }, { is_accepted: true })
    .exec()
}

export default gameReportSchema