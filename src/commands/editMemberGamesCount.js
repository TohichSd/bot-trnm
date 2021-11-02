import { GuildModel, MemberModel } from '../db/dbModels.js'
import { sendReport } from '../bot.js'
import updateScoreTable from '../controllers/updateScoreTable.js'

const main = async message => {
  const Guild = await GuildModel.findOneByGuildID(message.guild.id)
    .catch(err => sendReport(err))
  if(Guild === null) {
    message.reply('Ошибка')
    sendReport(`Guild ${message.guild.name} (${message.guild.id}) not found in db`)
    return
  }
  const args = message.content.replace(/ +(?= )/g, '').split(' ')
  if (
    message.mentions.members.size < 1 ||
    (args[args.length - 1][0] !== '-' && args[args.length - 1][0] !== '+')
  )
    throw new Error('Invalid syntax')

  let points = parseInt(args[args.length - 1].slice(1), 10)
  if(args[args.length - 1][0] === '-') points *= -1
  
  await Promise.all(message.mentions.members.map(async member => {
    const memberDB = await MemberModel.findMemberByID(member.id, member.guild.id)
    await memberDB.editGamesCount(points)
  }))
  
  await updateScoreTable(message.guild.id)
  await message.react('✅')
}

export default {
  name: 'игры',
  run: main,
  description:
    'Редактировать количество игр участника(ов).',
  showhelp: true,
  syntax: '!игры @участник1 @участник2 ... +-количество',
  permissions: 1,
}
