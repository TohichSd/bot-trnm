import DAccess from "../db/commonUtils.js"
import { sendReport } from "../bot.js"

const main = async (message) => {
  await DAccess.updateOne(
    "guilds",
    { guild_id: message.guild.id },
    { applications_channel: message.channel.id }
  ).catch((err) => {
    sendReport(err)
    message.reply(`Ошибка`)
  })
}

export default {
  name: "здесь-заявки",
  run: main,
  description:
    "Установить канал для заявок на турниры. Если турнир уже объявлен, изменения будут применены к следующему турниру.",
  showhelp: true,
  permissions: 1,
}
