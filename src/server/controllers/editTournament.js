import {MessageEmbed} from "discord.js";
import moment from "moment";
import { GuildModel, EventModel, ApplicationModel } from '../../db/models.js'
import {getChannel} from "../../bot.js";
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
  const event = await EventModel.findById(req.params.e_id)
  await event.update({
    name: req.body.name,
    description: req.body.description,
    loot: req.body.awards,
    datetimeMs: moment(req.body.datetime).valueOf(),
    isRandom: req.body.random,
  })
  const datetimeFormatted = moment(req.body.datetime).locale('ru').format('LLLL') + ' по мск'

  const guildDB = await GuildModel.findOneByGuildID(req.params.id)
  const trnmChannel = await getChannel(req.params.id, guildDB.tournament_channel)
  const trnmMessage = await trnmChannel.messages.fetch(event.message_id)
  const embedTrnm = new MessageEmbed()
    .setColor(trnmMessage.embeds[0].color)
    .setTitle(`**${req.body.name.toUpperCase()}**`)
    .addField(strings.description, req.body.description)
    .addField(strings.loot, req.body.awards)
    .addField(strings.datetime, datetimeFormatted+'\n')
    .setThumbnail(strings.image)
    .setFooter(strings.footer)

  if (event.members.length > 0) {
    let membersString = ''
    await Promise.all(
      event.members.map(async (evMember, index) => {
        const memberApplication = await ApplicationModel.findOneByID(evMember.id)
        membersString += `**${index+1}. **<@${memberApplication.id}> ${memberApplication.link}`
      })
    )

    embedTrnm.addField(':game_die: УЖЕ УЧАСТВУЮТ: :game_die:', membersString)
  }
  
  await trnmMessage.edit(embedTrnm)
  next()
}
