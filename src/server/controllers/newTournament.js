import {getChannel} from '../../bot.js'
import Tournament from '../../controllers/Tournament.js'
import {GuildModel} from '../../db/models.js'

export default async (req, res, next) => {
  if (
    !req.body.name ||
    !req.body.description ||
    !req.body.awards ||
    !req.body.datetime
  ) {
    const err = new Error('Зполните все поля')
    err.statusCode = 400
    next(err)
    throw err
  }
  if (!req.params.id) {
    const err = new Error('Guild id is required')
    err.statusCode = 400
    next(err)
    throw err
  }
  const guild = await GuildModel.findOneByGuildID(req.params.id)
  if (!guild.tournament_channel) {
    const err = new Error('Канал для турниров не задан!')
    err.statusCode = 400
    next(err)
  }
  const channelT = await getChannel(guild.guild_id, guild.tournament_channel)
  const tournament = new Tournament(
    req.body.name,
    req.body.description,
    req.body.awards,
    req.body.datetime,
    req.body.random,
    req.params.id
  )
  await tournament.send(channelT)
  await tournament.addToDB()
  req.body = null
  next()
}
