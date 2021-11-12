import mongoose from 'mongoose'
import cachegoose from 'cachegoose'

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
      index: true,
    },
    winIndex: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    collection: 'members',
  }
)

memberSchema.statics.getMaxWins = async function () {
  const res = await this.find({}, { wins: 1, _id: 0 })
    .sort({ wins: -1 })
    .limit(1)
    .cache('maxWins')
    .exec()
  return res[0].wins
}

memberSchema.statics.getAllGuildMembers = async function (guild_id) {
  return this.find({ guild_id, games: { $gt: 0 } }).exec()
}

/**
 * Возвращает 25 лучших по winIndex учатсников
 * @param {String} guild_id
 * @return {Promise<[MemberModel]>}
 */
memberSchema.statics.getBestGuildMembers = async function (guild_id) {
  return this.find({ guild_id, games: { $gt: 0 } })
    .sort({ winIndex: -1 })
    .exec()
}

memberSchema.statics.findMemberByID = async function (id, guild_id) {
  return this.findOne({ id, guild_id, games: { $gt: 0 } })
    .cache(`member${id}${guild_id}`)
    .exec()
}

memberSchema.methods.editGamesCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  await mongoose
    .model('Member')
    .updateOne(
      { _id: this._id },
      { 
        $inc: { games: count },
        $set: {
          winIndex: await this.calculateWinIndex(),
        },
      }
    )
    .exec()
  await this.calculateWinIndex()
}

memberSchema.methods.editWinsCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  const model = await mongoose.model('Member')
  model
    .updateOne(
      { _id: this._id },
      {
        $inc: {
          games: count,
          wins: count,
        },
        $set: {
          winIndex: await this.calculateWinIndex(),
        },
      }
    )
    .exec()
  if (this.wins + count > (await model.getMaxWins()))
    cachegoose.clearCache('maxWins')
}

memberSchema.methods.setGamesCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  await mongoose
    .model('Member')
    .updateOne(
      { _id: this._id },
      { $set: { games: count, winIndex: await this.calculateWinIndex() } }
    )
    .exec()
}

memberSchema.methods.setWinsCount = async function (count) {
  cachegoose.clearCache(`member${this.id}${this.guild_id}`)
  const model = await mongoose.model('Member')
  model
    .updateOne(
      { _id: this._id },
      { $set: { wins: count, winIndex: await this.calculateWinIndex() } }
    )
    .exec()
  if (count > (await model.getMaxWins())) cachegoose.clearCache('maxWins')
}

memberSchema.methods.calculateWinIndex = async function () {
  const model = await mongoose.model('Member')
  const maxWins = await model.getMaxWins()
  return (((2 * this.wins) / maxWins) * this.wins) / this.games
}

export default memberSchema
