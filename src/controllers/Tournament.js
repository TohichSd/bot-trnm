import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import { readFile } from 'fs'
import DBUtils from '../db/commonUtils.js'

class Tournament {
  /**
   * @param {string} name Название
   * @param {string} description Описание
   * @param {string} loot Награды
   * @param {number} datetime Дата и время
   * @param {boolean} random Рандомный турнир
   */
  constructor(name, description, loot, datetime, random) {
    this.name = name
    this.description = description
    this.loot = loot
    this.datetimeMs = datetime
    this.random = random
    this.message = new MessageEmbed()
    this.datetimeFormated = moment(datetime).format('LLLL')
    readFile('config/tournament_strings.json.json', (err, data) => {
      const strings = JSON.parse(data.toString())
      this.message
        .setColor(strings.color)
        .setTitle(`**${name.toUpperCase()}**`)
        .setDescription(strings.descriptionHeader)
        .addField(strings.description, description)
        .addField(strings.loot, loot)
        .addField(strings.datetime, this.datetimeFormated)
        .setAuthor(
          random ? strings.newTRandom : strings.newT,
          strings.authorIcon
        )
        .setImage(strings.image)
        .setFooter(strings.footer)
        .setThumbnail(strings.thumbnail)
    })
  }

  /**
   * @param {ChannelType} channel
   * @return {number} id отправленного сообщения
   */
  async send(channel) {
    await channel
      .send(this.message)
      .then(message => message.id)
      .then(id => {
        DBUtils.insertOne('events', {
          datetimeMs: this.datetimeMs,
          description: this.description,
          loot: this.loot,
          guild_id: channel.guild.id,
          message_id: id,
        })
        return id
      })
  }
}

export default Tournament
