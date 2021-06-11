import { MessageEmbed } from 'discord.js'
import { ClanModel } from '../db/dbModels.js'

const main = async message => {
  /**
   * @type {Document[]}
   */
  const clans = await ClanModel.getAll().catch(err => {
    throw err
  })
  const embed = new MessageEmbed()
  embed.setColor('#1e531e')
  await Promise.all(
    clans.map(clan => {
      embed.setDescription(
        `${embed.description || ""}${clan.name}: <@&${clan.role_id}>\n`
      )
    })
  )
  message.reply(embed)
}

export default {
  run: main,
  name: 'список-кланов',
  description: 'Получить список кланов',
  permissions: 1,
}
