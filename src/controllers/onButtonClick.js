import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import { ApplicationModel, EventModel, GuildModel } from '../db/models.js'
import { getChannel, getGuildMember, sendReport } from '../bot.js'
import strings from '../config/tournament_message.js'

export default async button => {
  const member = await getGuildMember(
    button.clicker.id,
    button.message.guild.id
  )
  let event = await EventModel.findOneByMessageID(button.message.id)
  if (event === null) {
    sendReport(
      new Error(
        `Tournament not found. Message ID: ${button.message.id}. Clicker: ${member.displayName} ${button.clicker.id}`
      )
    )
    return
  }
  if (event.datetimeMs < new Date().getMilliseconds() - 60 * 60 * 1000) return

  const guildDB = await GuildModel.findOneByGuildID(button.message.guild.id)

  // Получен ли сервер
  if (guildDB === null) {
    sendReport(
      new Error(
        `Guild not found. Message ID: ${button.message.id}. Clicker: ${member.displayName} ${button.clicker.id}`
      )
    )
    return
  }
  // Проверка наличия канала для отправки заявок
  if (guildDB.applications_channel === undefined) {
    await button.reply.send(
      'Не установлен канал для отправки заявок, обратитесь к администрации сервера'
    )
    return
  }

  // Если заявка уже отправлена
  const eventMember = event.members.find(m => m.id === member.id)
  if (eventMember) {
    event = await event.removeMember(member.id)
    await button.reply.send('Ваша заявка удалена :sob:', true)
  } else {
    const application = await ApplicationModel.findOne({
      id: button.clicker.id,
      // guild_id: button.message.guild.id,
    }).exec()

    // Проверка наличия заявки у участника
    if (application === null) {
      await button.reply.send(
        `У вас ещё не заполнена заявка, заполните её в канале <#${guildDB.new_app_channel}>`,
        true
      )
      return
    }

    // Добавления участника в бд
    event = await event.addMember(button.clicker.id)
    await button.reply
      .send(
        'Ваша заявка учтена! Если вы передумали, нажмите на кнопку ещё раз.',
        true
      )
      .catch(sendReport)
  }

  const trnmChannel = await getChannel(
    button.message.guild.id,
    guildDB.tournament_channel
  )
  const trnmMessage = await trnmChannel.messages.fetch(event.message_id)

  const datetimeFormatted =
    moment(event.datetimeMs).locale('ru').format('LLLL') + ' по мск'

  const embedTrnm = new MessageEmbed()
    .setColor(trnmMessage.embeds[0].color)
    .setTitle(`**${event.name.toUpperCase()}**`)
    .addField(strings.description, event.description)
    .addField(strings.loot, event.loot)
    .addField(strings.datetime, datetimeFormatted+'\n')
    .setThumbnail(strings.image)
    .setFooter(strings.footer)

  // Добавление участников
  if (event.members.length > 0) {
    let membersString = ''
    await Promise.all(
      event.members.map(async (evMember, index) => {
        const memberApplication = await ApplicationModel.findOneByID(evMember.id)
        membersString += `**${index+1}. **<@${memberApplication.id}> ${memberApplication.link}\n`
      })
    )

    embedTrnm.addField(':game_die: УЖЕ УЧАСТВУЮТ: :game_die:', membersString)
  }

  await trnmMessage.edit(embedTrnm)
}
