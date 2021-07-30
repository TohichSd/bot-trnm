import { MessageEmbed } from 'discord.js'
import { ApplicationModel, EventModel, GuildModel } from '../db/dbModels.js'
import { getChannel, getGuildMember, sendReport } from '../bot.js'

export default async button => {
  const member = await getGuildMember(button.clicker.id, button.message.guild.id)
  const event = await EventModel.findOneByMessageID(button.message.id)
  if (event === null) {
    sendReport(new Error(`Tournament not found. Message ID: ${button.message.id}. Clicker: ${member.displayName} ${button.clicker.id}`))
    return
  }
  if (event.datetimeMs < new Date().getMilliseconds()) return
  const guildDB = await GuildModel.findOneByGuildID(button.message.guild.id)
  // Получен ли сервер
  if (guildDB === null) {
    sendReport(new Error(`Guild not found. Message ID: ${button.message.id}. Clicker: ${member.displayName} ${button.clicker.id}`))
    return
  }
  // Проверка наличия канала для отправки заявок
  if (guildDB.applications_channel === undefined) {
    /**
     * @param {TextChannel} button.message.channel
     */
    const errMgs = await button.message.channel.send(
      `<@${button.clicker.id}>, Не установлен канал для отправки заявок, обратитесь к администрации сервера`
    )
    setTimeout(() => {
      errMgs.delete()
    }, 11000)
    return
  }

  // Канал с заявками
  const channel = await getChannel(
    button.message.guild.id,
    guildDB.applications_channel
  )
  
  // Если заявка уже отправлена
  const eventMember = event.members.find(m => m.id === member.id)
  if(eventMember) {
    await event.removeMember(member.id)
    const message = await channel.messages.fetch(eventMember.message_id)
    message.delete()
    await button.reply.send('Ваша заявка удалена!', true)
    return
  }
  
  const application = await ApplicationModel.findOne({
    id: button.clicker.id,
    guild_id: button.message.guild.id,
  }).exec()
  
  // Проверка наличия заявки у участника
  if (application === null) {
    const errMgs = await button.message.channel.send(
      `<@${button.clicker.id}>, У вас ещё не заполнена заявка, заполните её в канале <#${guildDB.new_app_channel}>`
    )
    setTimeout(() => {
      errMgs.delete()
    }, 11000)
    return
  }
  
  // Отпрвка заявки
  const embedApplication = new MessageEmbed()
    .setThumbnail('https://i.ibb.co/H4zQ4YB/Check-mark-svg.png')
    .setTitle(
      `**Заявка участника *${member.displayName}* на турнир *"${event.name}"* **`
    )
    .addField(':link: Ссылка на steam:', application.link)
    .addField(':video_game: Уровень в игре:', application.level)
    .addField(':man_mage: Возраст:', application.age)
    .addField(':microphone2: Наличие микрофона:', application.micro)
    .setColor('#4287f5')
  const appMessage = await channel.send(embedApplication)

  // Добавления участника в бд
  event.addMember(button.clicker.id, appMessage.id)
  await button.reply.send('Ваша заявка учтена! Если вы передумали, нажмите на кнопку ещё раз.', true)
}