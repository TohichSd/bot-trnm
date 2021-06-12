import { GuildModel } from '../db/dbModels.js'

const main = async message => {
  const Guild = await GuildModel.findOneByGuildID(message.guild.id).catch(
    err => {
      throw err
    }
  )
  if (Guild === null)
    throw new Error(
      `Guild ${message.guild.name} (${message.guild.id}) not found in db`
    )
  await Guild.setClanWarsChannel(message.channel.id)
  await message.react('✅')
}

export default {
  name: 'здесь-войны',
  run: main,
  description: 'Установить канал для клановых войн',
  showhelp: true,
  permissions: 1,
}
