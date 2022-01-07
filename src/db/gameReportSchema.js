import mongoose from "mongoose"

const gameReportSchema = new mongoose.Schema(
  {
    // ID автора
    author: {
      required: true,
      type: String
    },
    // ID учатсников
    members: {
      required: true,
      type: [String]
    },
    datetimeMs: {
      required: true,
      type: Number
    },
    // ID победителя
    winner: {
      required: true,
      type: String
    },
    message_id: String,
  },
  {
    collection: 'game_reports'
  }
)

export default gameReportSchema