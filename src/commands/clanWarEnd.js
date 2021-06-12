import { MessageEmbed } from 'discord.js'
import { ClanWarModel, GuildModel } from '../db/dbModels.js'
import { getChannel } from '../bot.js'

const main = async message => {
  const clanWar = await ClanWarModel.getLatestClanWar(message.guild.id)
  if (!clanWar) {
    message.reply('Нет активной войны!')
    return
  }
  const guildDB = await GuildModel.findOneByGuildID(message.guild.id)
  const channel = await getChannel(
    message.guild.id,
    await guildDB.clan_wars_channel
  )
  /**
   * @type {MessageEmbed}
   */
  const cwMessage = await channel.messages.fetch(clanWar.message_id)
  const { fields, image, description, title } = cwMessage.embeds[0]
  const embed = new MessageEmbed()
    .setAuthor(`(ОКОНЧЕНА)`)
    .setTitle(title)
    .setDescription(description)
    .setImage(image.url)
    .setColor('#d73939')
    .addFields(fields)
  await clanWar.end()
  await cwMessage.edit(embed)
  await message.react('✅')
}

export default {
  run: main,
  name: 'закончить-войну',
  description: 'Закончить клановую войну',
  permissions: 1,
}
