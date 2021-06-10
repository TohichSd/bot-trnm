import { sendReport } from "../bot.js"
import { GuildModel } from '../db/dbModels.js'

const main = async (message) => {
  // Роли, упомянутые в сообщении
  const { roles } = message.mentions
  const IDs = await Promise.all(roles.map((role) => role.id))
  const names = await Promise.all(roles.map((role) => role.name))
  const Guild = await GuildModel.findOne({ guild_id: message.guild.id })
  try {
    await Guild.removeAdminRole(IDs)
  }
  catch (e) {
    sendReport(e)
    message.reply('Ошибка')
    return
  }
  names.forEach((name) => {
    message.reply(`Роль "${name}" теперь не имеет право управления ботом.`)
  })
}

export default {
  run: main,
  name: "не-админ",
  description: "Убрать у роли право управления ботом",
}
