import DAccess from "../db/commonUtils.js"
import { sendReport } from "../bot.js"

const main = async (message) => {
  await DAccess.updateOne(
    "guilds",
    { guild_id: message.guild.id },
    { tournament_channel: message.channel.id }
  ).catch((err) => {
    sendReport(err)
    message.reply(`Ошибка`)
  })
}

export default {
  run: main,
  name: "здесь-турниры",
  permissions: 1,
  description: "Установить канал для объявлений о турнирах",
}
