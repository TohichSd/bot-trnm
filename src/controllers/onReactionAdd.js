import { MessageEmbed } from 'discord.js'
import { EventModel, GuildModel, ApplicationModel } from '../db/dbModels.js'
import { getChannel, getGuildMember, sendReport } from '../bot.js'

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 * @return {Promise<void>}
 */
export default async (reaction, user) => {
  if (user.bot) return
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if(reaction.emoji.name !== '✅') return
  const event = await EventModel.findOneByMessageID(reaction.message.id)
  // Найден ли турнир в бд
  if (event === null) return
  // Не истёк ли срок проведения турнира
  if (event.datetimeMs < new Date().getMilliseconds()) return
  const guildDB = await GuildModel.findOneByGuildID(reaction.message.guild.id)
  // Получен ли сервер
  if (guildDB === null) {
    sendReport(new Error('Guild not found'))
    return
  }
  const member = await getGuildMember(user.id, reaction.message.guild.id)
  // Проверка наличия канала для отправки заявок
  if (guildDB.applications_channel === undefined) {
    const errMgs = await reaction.message.channel.send(
      `<@${user.id}>, Не установлен канал для отправки заявок, обратитесь к администрации сервера`
    )
    setTimeout(() => {
      errMgs.delete()
    }, 11000)
    await reaction.users.remove(member)
    return
  }
  const application = await ApplicationModel.findOne({
    id: user.id,
    guild_id: reaction.message.guild.id,
  }).exec()
  // Проверка наличия заявки у участника
  if (application === null) {
    const errMgs = await reaction.message.channel.send(
      `<@${user.id}>, У вас ещё не заполнена заявка, заполните её в канале <#${guildDB.new_app_channel}>`
    )
    setTimeout(() => {
      errMgs.delete()
    }, 11000)
    await reaction.users.remove(member)
    return
  }
  const channel = await getChannel(
    reaction.message.guild.id,
    guildDB.applications_channel
  )
  
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
  event.addMember(member.id, appMessage.id)
}
