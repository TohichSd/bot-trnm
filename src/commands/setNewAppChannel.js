import { sendReport } from '../bot.js'
import { GuildModel } from '../db/dbModels.js'

const main = async message => {
  const Guild = await GuildModel.findOneByGuildID(message.guild.id)
    .catch(err => sendReport(err))
  if(Guild === null) {
    message.reply('Ошибка')
    sendReport(`Guild ${message.guild.name} (${message.guild.id}) not found in db`)
    return
  }
  await Guild.setNewAppChannel(message.channel.id)
  await message.react('✅')
}

export default {
  name: 'здесь-заполнение',
  run: main,
  description:
    'Установить канал для заполнения заявок.',
  showhelp: true,
  permissions: 1,
}
