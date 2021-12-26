import { MessageEmbed } from 'discord.js'
import { MemberModel } from '../db/models.js'

/**
 * @param {module:"discord.js".Message} message
 * @return {Promise<void>}
 */
const main = async message => {
  let member
  if(message.mentions.members.size > 1) {
    message.reply('Слишком много упоминаний')
    return 
  }
  if(message.mentions.members.size === 1) member = message.mentions.members.first()
  else member = message.member
  const memberDB = await MemberModel.findMemberByID(member.id, member.guild.id)
  if (memberDB === null) {
    if(member.id === message.member.id) message.reply('Вы ещё не сыграли ни одной рейтиноговой игры!')
    else message.reply(`У <@${member.id}> ещё нет ни одной сыгранной рейтинговой игры!`)
    return
  }
  const statEmbed = new MessageEmbed()
    .setDescription(`Статистика игрока <@${member.id}>`)
    .setColor('#3e76b2')
    .addField(':trophy: Победы:', memberDB.wins)
    .addField(':game_die: Всего игр:', memberDB.games)
  await message.reply(statEmbed)
}

export default {
  run: main,
  name: 'стат',
  permissions: 0,
  description: 'Посмотерть статистику игрока',
}