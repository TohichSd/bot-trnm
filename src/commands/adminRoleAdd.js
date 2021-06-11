import { GuildModel } from '../db/dbModels.js'

const main = async message => {
  // Роли, упомянутые в сообщении
  const { roles } = message.mentions
  if (roles.length < 1) throw new Error(`Invalid syntax`)
  const IDs = await Promise.all(roles.map(role => role.id))
  const names = await Promise.all(roles.map(role => role.name))
  const Guild = await GuildModel.findOneByGuildID(message.guild.id)
  await Guild.addAdminRole(IDs).catch(err => {
    throw err
  })
  names.forEach(name => {
    message.reply(`Роль "${name}" теперь имеет право управления ботом.`)
  })
}

export default {
  run: main,
  name: 'админ',
  description: 'Дать роли право управления ботом',
  syntax: '!админ < роль1, роль2... >',
  permissions: 1,
}
