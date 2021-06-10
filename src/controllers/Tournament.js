import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import { promises } from 'fs'
import { EventModel } from '../db/dbModels.js'
import { sendReport } from '../bot.js'

class Tournament {
  /**
   * @param {string} name Название
   * @param {string} description Описание
   * @param {string} loot Награды
   * @param {number} datetime Дата и время
   * @param {boolean} random Рандомный турнир
   * @param {String} guildID
   */
  constructor(name, description, loot, datetime, random, guildID) {
    this.name = name
    this.description = description
    this.loot = loot
    this.datetimeMs = moment(datetime).valueOf()
    this.random = random
    this.guildID = guildID
    this.datetimeFormated = moment(datetime).locale('ru').format('LLLL')
    this.message = new MessageEmbed()
  }

  /**
   * @param channel
   * @return {Promise<void>}
   */
  async send(channel) {
    const strings = JSON.parse(
      await promises
        .readFile('src/config/tournament_message.json')
        .then(data => data.toString())
        .catch(sendReport)
    )
    if (strings === undefined) return
    this.message
      .setColor(strings.color)
      .setTitle(`**${this.name.toUpperCase()}**`)
      .setDescription(strings.descriptionHeader)
      .addField(strings.description, this.description)
      .addField(strings.loot, this.loot)
      .addField(strings.datetime, this.datetimeFormated)
      .setAuthor(
        this.random ? strings.newTRandom : strings.newT,
        strings.authorIcon
      )
      .setImage(strings.image)
      .setFooter(strings.footer)
      .setThumbnail(strings.thumbnail)
    await channel.send(this.message).then(message => {
      this.messageID = message.id
      this.guildID = message.guild.id
      message.react(`✅`)
    })
  }

  /**
   * @return {Promise<void>}
   */
  async addToDB() {
    if (!this.messageID || !this.guildID)
      throw new Error('No message id || guild id specified')
    const Event = new EventModel({
      name: this.name,
      description: this.description,
      loot: this.loot,
      datetimeMs: this.datetimeMs,
      message_id: this.messageID,
      guild_id: this.guildID,
    })
    await Event.save()
  }
}

export default Tournament
