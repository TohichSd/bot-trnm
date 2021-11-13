import { MessageEmbed } from 'discord.js'
import { ClanModel, ClanWarModel, GuildModel } from '../db/models.js'
import { getChannel, numberToEmojis } from '../bot.js'
import cwStrings from '../config/clan_war_message.js'

const main = async message => {
  const args = message.content.replace(/ +(?= )/g, '').split(' ')
  if (
    message.mentions.roles.size !== 1 ||
    (args[2][0] !== '-' && args[2][0] !== '+')
  )
    throw new Error('Invalid syntax')
  const role = message.mentions.roles.first()
  const sign = args[2][0]
  const points = parseInt(args[2].slice(1), 10)
  const clan = await ClanModel.getClanByRoleID(role.id)
  if (sign === '-') await clan.setPoints(clan.points - points)
  else await clan.setPoints(clan.points + points)
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
   * @type {Message}
   */
  const cwMessage = await channel.messages.fetch(clanWar.message_id)
  const embed = new MessageEmbed()
    .setTitle(clanWar.name)
    // .setAuthor(cwStrings.author)
    .setDescription(`Длительность: ${clanWar.duration}`)
    .setImage(cwStrings.image)
    .setColor(cwStrings.color)
  const clans = await ClanModel.getAllGuildClans(message.guild.id)
  await Promise.all(
    clans.map(async clanEA => {
      embed.addField(
        clanEA.name,
        `${await numberToEmojis(clanEA.points)} :star2:`,
        true
      )
    })
  )
  await cwMessage.edit(embed)
  await message.react('✅')
}

export default {
  run: main,
  name: 'очки',
  description: 'Изменить очки клана',
  syntax:
    '!очки < клановая роль > < +-количество >. Например !очки @клан-зайцев +100',
  permissions: 1,
}
