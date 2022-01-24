import { MessageEmbed } from 'discord.js'
import { GameReportModel, MemberModel, GuildModel } from '../db/models.js'
import {
  getGuildMember,
  sendReport,
  isMemberAdmin,
  getChannel,
} from '../bot.js'

/**
 * @param {module:"discord.js".MessageReaction} reaction
 * @param {User} user
 * @return {Promise<void>}
 */
export default async (reaction, user) => {
  if (user.bot) return
  if (reaction.message.partial) await reaction.message.fetch()
  if (reaction.partial) await reaction.fetch()
  if (reaction.emoji.name !== '✅') return
  
  // Member, добавивший реакцию
  const member = await getGuildMember(user.id, reaction.message.guild.id)
  
  if (!(await isMemberAdmin(member.id, reaction.message.guild.id))) return
  const gameReportDB = await GameReportModel.findOneByMessageID(
    reaction.message.id
  )
  const guildDB = await GuildModel.findOneByGuildID(reaction.message.guild.id)
  if (!gameReportDB) return
  if (gameReportDB.is_accepted) return
  
  // Добавление игр участникам
  await Promise.all(
    gameReportDB.members.map(async memberID => {
      let memberDB = await MemberModel.findMemberByID(memberID, reaction.message.guild.id)
      if(memberDB === null) memberDB = await (new MemberModel({id: memberID, guild_id: reaction.message.guild.id}).save())
      if (memberID !== gameReportDB.winner) await memberDB.editGamesCount(1)
      else await memberDB.editWinsCount(1)
    })
  )
  await gameReportDB.accept()
  const reportsChannel = await getChannel(
    reaction.message.guild.id,
    guildDB.game_report_channel
  )
  const reportMessage = await reportsChannel.messages.fetch(
    gameReportDB.message_id
  )
  const embedReportEdit = new MessageEmbed()
    .setTitle(reportMessage.embeds[0].title)
    .setImage(reportMessage.embeds[0].image.url)
    .setFooter('✅ Победа засчитана')
    .setColor(reportMessage.embeds[0].color)
  reportMessage.embeds[0].fields.map(field => {
    embedReportEdit.addField(
      field.name !== '' ? field.name : '\u200b',
      field.value
    )
  })
  try {
    await reportMessage.edit(embedReportEdit)
  } catch (e) {
    sendReport(e)
  }
}
