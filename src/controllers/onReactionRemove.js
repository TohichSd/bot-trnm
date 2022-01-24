import { EventModel, GuildModel } from '../db/models.js'
import { getChannel, sendReport } from '../bot.js'

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
  
  // Найден ли турнир
  if (event === null) return
  
  // Не истёк ли срок проведения турнира
  if (event.datetimeMs < new Date().getMilliseconds()) return
  
  // Зарегистрирован ли участник на турнир
  const memberReg = event.members.find(m => m.id === user.id)
  if(!memberReg) return
  
  const guildDB = await GuildModel.findOneByGuildID(reaction.message.guild.id)
  
  // Получен ли сервер
  if (guildDB === null) {
    sendReport(new Error('Guild not found'), reaction.message.guild.id)
    return
  }
  
  const channel = await getChannel(
    reaction.message.guild.id,
    guildDB.applications_channel
  )
  
  event.removeMember(user.id)
  
  const message = await channel.messages.fetch(memberReg.message_id)
  message.delete()
}