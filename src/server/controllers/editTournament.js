import {GuildModel, EventModel} from "../../db/models.js";
import moment from "moment";
import {getChannel} from "../../bot.js";
import {MessageEmbed} from "discord.js";
import strings from "../../config/tournament_message.js";

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
  const tournament = await EventModel.findById(req.params.e_id)
  await tournament.update({
    name: req.body.name,
    description: req.body.description,
    loot: req.body.awards,
    datetimeMs: moment(req.body.datetime).valueOf(),
    isRandom: req.body.random,
  })
  const datetimeFormatted = moment(req.body.datetime).locale('ru').format('LLLL') + ' по МСК'

  const guildDB = await GuildModel.findOneByGuildID(req.params.id)
  const trnmChannel = await getChannel(req.params.id, guildDB.tournament_channel)
  const trnmMessage = await trnmChannel.messages.fetch(tournament.message_id)
  const embedTrnm = new MessageEmbed()
    .setColor(strings.color)
    .setTitle(`**${req.body.name.toUpperCase()}**`)
    .setDescription(strings.descriptionHeader)
    .addField(strings.description, req.body.description)
    .addField(strings.loot, req.body.awards)
    .addField(strings.datetime, datetimeFormatted)
    .setThumbnail(strings.image)
    .setFooter(strings.footer)
  await trnmMessage.edit(embedTrnm)
  next()
}
