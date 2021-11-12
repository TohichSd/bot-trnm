import { MessageEmbed } from 'discord.js'
import { ClanModel } from '../db/models.js'

const main = async message => {
  /**
   * @type {Document[]}
   */
  const clans = await ClanModel.getAllGuildClans(message.guild.id).catch(err => {
    throw err
  })
  if(clans.length === 0) {
    message.reply('Нет кланов!')
    return
  }
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
  name: 'кланы',
  description: 'Получить список кланов',
  permissions: 1,
}
