import {GuildModel} from "../../db/models.js";
import moment from "moment";

export default async (req, res) => {
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
  const tournament = await EventModel.findById(req.params.e_id)
  await tournament.update({
    name: req.body.name,
    description: req.body.description,
    loot: req.body.awards,
    datetimeMs: moment(req.body.datetime).valueOf(),
    isRandom: req.body.random,
  })
}
