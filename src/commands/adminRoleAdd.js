import DAccess from "../db/commonUtils.js"
import { sendReport } from "../bot.js"

const main = async (message) => {
  // Роли, упомянутые в сообщении
  const { roles } = message.mentions
  const IDs = await Promise.all(roles.map((role) => role.id))
  const names = await Promise.all(roles.map((role) => role.name))
  await DAccess.updateMany(
    'guilds',
    { guild_id: message.guild.id },
    { $addToSet: { admin_roles: { $each: IDs } } }
  ).catch((err) => {
    sendReport(err)
    message.reply(`Ошибка`)
  })
  names.forEach((name) => {
    message.reply(`Роль "${name}" теперь имеет право управления ботом.`)
  })
}

export default {
  run: main,
  name: "админ",
  description: "Дать роли право управления ботом",
}
