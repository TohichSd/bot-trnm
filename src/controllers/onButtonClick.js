import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import { ApplicationModel, EventModel, GuildModel } from '../db/models.js'
import { botLog, getChannel, getGuildMember, sendReport } from '../bot.js'
import strings from '../config/tournament_message.js'

export default async button => {
  if (button.id !== 'apps' && button.id !== 'trnm') return

  // Получение турнира из бд
  let event = await EventModel.findOneByMessageID(button.message.id)

  // Получение участника сервера по его ID
  const member = await getGuildMember(
    button.clicker.id,
    button.message.guild.id
  )

  // Проверка получения туринра из бд
  if (event === null) {
    sendReport(
      new Error(
        `Tournament not found. Message ID: ${button.message.id}. Clicker: ${member.displayName} ${button.clicker.id}`,
        button.message.guild.id
      )
    )
    return
  }

  // Не просрочен ли турнир
  if (event.datetimeMs < new Date().getMilliseconds() - 60 * 60 * 1000) return

  //-----------------------------------
  // Если нажата кнопка 'показать заявки'
  if (button.id === 'apps') {
    if (event.members.length === 0) {
      await button.reply.send('Никто не пришёл на сходку(((', true)
      return
    }
    const embedApps = new MessageEmbed().setColor('#e5b53d')
    await Promise.all(
      event.members.map(async (evMember, index) => {
        const memberApplication = await ApplicationModel.findOneByID(
          evMember.id
        )
        embedApps.addField(
          `${index + 1}.`,
          `|- <@${memberApplication.id}> (${memberApplication.level} уровень, :loud_sound:: ${memberApplication.micro})\n|- ${memberApplication.link}`
        )
      })
    )
    await button.reply.send(embedApps, true)
    return
  }

  // Если нажата кнопка 'принять участние'
  if (button.id === 'trnm') {
    const guildDB = await GuildModel.findOneByGuildID(button.message.guild.id)

    // Получен ли сервер
    if (guildDB === null) {
      sendReport(
        new Error(
          `Guild not found. Message ID: ${button.message.id}. Clicker: ${member.displayName} ${button.clicker.id}`,
          button.message.guild.id
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

    const trnmChannel = await getChannel(
      button.message.guild.id,
      guildDB.tournament_channel
    )

    // Если заявка уже отправлена
    const eventMember = event.members.find(m => m.id === member.id)
    if (eventMember) {
      event = await event.removeMember(member.id)
      await button.reply.send('Ваша заявка удалена :sob:', true)
      
      await botLog(
        `TRNM: - участник на турнир "${event.name}"`,
        button.message.guild.id,
        1,
        trnmChannel.id,
        button.clicker.id
      )
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
        .catch(err => sendReport(err, button.message.guild.id))
      
      await botLog(
        `TRNM: + участник на турнир "${event.name}"`,
        button.message.guild.id,
        1,
        trnmChannel.id,
        button.clicker.id
      )
    }

    const trnmMessage = await trnmChannel.messages.fetch(event.message_id)

    const datetimeFormatted =
      moment(event.datetimeMs).locale('ru').format('LLLL') + ' по мск'

    const embedTrnm = new MessageEmbed()
      .setColor(trnmMessage.embeds[0].color)
      .setTitle(`**${event.name.toUpperCase()}**`)
      .addField(strings.description, event.description)
      .addField(strings.loot, event.loot)
      .addField(strings.datetime, datetimeFormatted + '\n')
      .setThumbnail(strings.image)
      .setFooter(strings.footer)

    // Добавление участников
    if (event.members.length > 0) {
      let membersString = ''
      await Promise.all(
        event.members.map(async (evMember, index) => {
          const memberApplication = await ApplicationModel.findOneByID(
            evMember.id
          )
          membersString += `<@${memberApplication.id}>`
          if (index !== event.members.length - 1) membersString += ', '
        })
      )

      // игрок_ || игрокА || игрокОВ
      let a_ov_ = ''
      if (event.members.length === 0) a_ov_ = ''
      else if (event.members.length > 1 && event.members.length < 5) a_ov_ = 'А'
      else if (event.members.length > 4) a_ov_ = 'ОВ'
      embedTrnm.addField(
        `:game_die: УЖЕ УЧАСТВУ${event.members.length > 1 ? 'ЮТ' : 'ЕТ'} ${
          event.members.length
        } ИГРОК${a_ov_}:game_die:`,
        membersString
      )
    }

    await trnmMessage.edit(embedTrnm)
  }
}
