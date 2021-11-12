import { sendReport } from '../bot.js'
import { GuildModel } from '../db/models.js'

const main = async message => {
  const Guild = await GuildModel.findOneByGuildID(message.guild.id)
    .catch(err => sendReport(err))
  if(Guild === null) {
    message.reply('Ошибка')
    sendReport(`Guild ${message.guild.name} (${message.guild.id}) not found in db`)
    return
  }
  await Guild.setApplicationsChannel(message.channel.id)
  await message.react('✅')
}

export default {
  name: 'здесь-заявки',
  run: main,
  description:
    'Установить канал для заявок на турниры. Если турнир уже объявлен, изменения будут применены к следующему турниру.',
  showhelp: true,
  permissions: 1,
}
