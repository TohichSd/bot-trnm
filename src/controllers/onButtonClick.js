import { MessageEmbed } from 'discord.js'
import { ApplicationModel, EventModel, GuildModel } from '../db/models.js'
import { getChannel, getGuildMember, sendReport } from '../bot.js'

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
  if (event.datetimeMs < new Date().getMilliseconds()) return
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

  // Канал с заявками
  const channelApps = await getChannel(
    button.message.guild.id,
    guildDB.applications_channel
  )

  // Если заявка уже отправлена
  const eventMember = event.members.find(m => m.id === member.id)
  if (eventMember) {
    event = await event.removeMember(member.id)
    await member.roles.remove(event.event_role_id)
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
    await button.reply.send(
      'Ваша заявка учтена! Если вы передумали, нажмите на кнопку ещё раз.',
      true
    )

    // Добавление участнику роли
    try {
      await member.roles.add(event.event_role_id)
    } catch (err) {
      sendReport(err)
    }
  }

  const embedMembers = new MessageEmbed()
    .setTitle(`Участники турнира ${event.name}`)
    .setColor('#4287f5')
    .setThumbnail('https://i.ibb.co/H4zQ4YB/Check-mark-svg.png')

  await Promise.all(
    event.members.map(async (evMember, index) => {
      const memberApplication = await ApplicationModel.findOneByID(evMember.id)
      embedMembers.addField(
        `${index + 1}.`,
        `|- <@${memberApplication.id}> (${memberApplication.level} уровень, :loud_sound:: ${memberApplication.micro})\n|- ${memberApplication.link}`
      )
    })
  )
  const messageApps = await channelApps.messages.fetch(event.message_apps_id)
  if (messageApps === undefined)
    await button.reply.send('Ошибка. Обратитесь к администрации сервера.')
  await messageApps.edit(embedMembers)
}
