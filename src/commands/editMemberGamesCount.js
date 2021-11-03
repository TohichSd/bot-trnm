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
  
  // Проверка синтаксиса
  if (
    message.mentions.members.size < 1 ||
    (args[args.length - 1][0] !== '-' && args[args.length - 1][0] !== '+' && args[args.length - 1][0] !== 's')
  )
    throw new Error('Invalid syntax')
  
  // Количество игр
  let points = parseInt(args[args.length - 1].slice(1), 10)
  if(args[args.length - 1][0] === '-') points *= -1
  
  await Promise.all(message.mentions.members.map(async member => {
    let memberDB = await MemberModel.findMemberByID(member.id, member.guild.id)
    if(memberDB === null) memberDB = await (new MemberModel({id: member.id, guild_id: member.guild.id}).save())
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
