import { GuildModel } from '../db/dbModels.js'
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
  await Guild.setScoreTableChannel(message.channel.id)
  await updateScoreTable(message.guild.id)
  await message.react('✅')
}

export default {
  name: 'здесь-таблица',
  run: main,
  description:
    'Установить канал для таблицы рейтинга.',
  showhelp: true,
  permissions: 1,
}
