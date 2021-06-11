import { sendReport } from "../bot.js"
import { GuildModel } from '../db/dbModels.js'

const main = async message => {
  const Guild = await GuildModel.findOneByGuildID(message.guild.id)
    .catch(err => sendReport(err))
  if(Guild === null) {
    message.reply('Ошибка')
    sendReport(`Guild ${message.guild.name} (${message.guild.id}) not found in db`)
    return
  }
  await Guild.setTournamentChannel(message.channel.id)
  message.reply('Готово!')
}

export default {
  run: main,
  name: "здесь-турниры",
  permissions: 1,
  description: "Установить канал для объявлений о турнирах",
}
