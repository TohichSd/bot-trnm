import { MessageEmbed } from 'discord.js'
import moment from 'moment/moment.js'
import { ClanModel, ClanWarModel, GuildModel } from '../db/dbModels.js'
import { getChannel, numberToEmojis } from '../bot.js'
import Interview from '../controllers/Interview.js'

const main = async message => {
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
    .setAuthor('Клановая война!')
    .setTitle(name)
    .setDescription(`Длительность: ${duration}`)
    .setImage('https://i.ibb.co/qmqsktv/images.png')
    .setColor('#8127fc')
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
