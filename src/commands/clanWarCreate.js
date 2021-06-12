import { MessageEmbed } from 'discord.js'
import moment from 'moment/moment.js'
import { promises } from 'fs'
import { ClanModel, ClanWarModel, GuildModel } from '../db/dbModels.js'
import { getChannel, numberToEmojis, sendReport } from '../bot.js'
import Interview from '../controllers/Interview.js'

const main = async message => {
  const cwStrings = JSON.parse(
    await promises
      .readFile('src/config/clan_war_message.json')
      .then(data => data.toString())
      .catch(sendReport)
  )
  const latestClanWar = await ClanWarModel.getLatestClanWar(message.guild.id)
  if(latestClanWar) {
    message.reply('Война уже идёт!')
    return
  }
  const guild = await GuildModel.findOneByGuildID(message.guild.id)
  if (!guild.clan_wars_channel) {
    message.reply('Канал для клановых войн не установлен!')
    return
  }
  /**
   * @type {Document[]}
   */
  const clans = await ClanModel.getAllGuildClans(message.guild.id)
  if (clans.length === 0) {
    message.reply('Нет кланов!')
    return
  }
  const interview = new Interview(
    {
      name: 'Как война будет называться?',
      duration: 'Сколько будеть длиться война?',
    },
    message.channel,
    message.member.id,
    'Начать клановую войну'
  )
  const answers = await interview.start()
  const { name } = answers
  const { duration } = answers
  // записьв бд
  const clanWar = await new ClanWarModel({
    name,
    duration,
    created_at: moment().valueOf(),
    guild_id: message.guild.id,
  }).save()
  // Канал с войнами кланов
  const channel = await getChannel(message.guild.id, guild.clan_wars_channel)
  const embed = new MessageEmbed()
    .setAuthor(cwStrings.author)
    .setTitle(name)
    .setDescription(`Длительность: ${duration}`)
    .setImage(cwStrings.image)
    .setColor(cwStrings.color)
  await Promise.all(
    clans.map(async clan => {
      await clan.setPoints(0)
      embed.addField(clan.name, await numberToEmojis(0), true)
    })
  )
  channel.send(embed).then(msg => {
    clanWar.setMessageID(msg.id)
  })
}

export default {
  run: main,
  name: 'клановая-война',
  description: 'Начать клановую войну',
  permissions: 1,
}
