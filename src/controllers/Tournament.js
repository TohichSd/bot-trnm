import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import discordButtons from 'discord-buttons'
import randomColor from 'randomcolor'
import { EventModel } from '../db/models.js'
import strings from '../config/tournament_message.js'

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
    this.datetimeFormatted =
      moment(datetime).locale('ru').format('LLLL') + ' по мск'
  }

  /**
   * @param channelT канал с туринрами
   * @return {Promise<void>}
   */
  async send(channelT) {
    const messageT = new MessageEmbed()
      .setColor(randomColor({ hue: 'green', luminosity: 'light' }))
      .setTitle(`**${this.name.toUpperCase()}**`)
      .addField(strings.description, this.description, true)
      .addField(strings.loot, this.loot)
      .addField(strings.datetime, this.datetimeFormatted+'\n')
      .setThumbnail(strings.image)
      .setFooter(strings.footer)
    // .setThumbnail(strings.thumbnail)

    const buttonAddMember = new discordButtons.MessageButton()
      .setLabel('ПРИНЯТЬ УЧАСТИЕ')
      .setStyle('green')
      .setID('trnm')

    const buttonShowApps = new discordButtons.MessageButton()
      .setLabel('Показать заявки')
      .setStyle('blurple')
      .setID('apps')

    await channelT.send(messageT, {buttons: [buttonAddMember, buttonShowApps]}).then(msg => {
      this.messageID = msg.id
      this.guildID = msg.guild.id
    })
  }

  /**
   * @return {Promise<void>}
   */
  async addToDB() {
    if (!this.messageID || !this.guildID)
      throw new Error('No message id || guild id specified')
    await EventModel.createEvent({
      name: this.name,
      description: this.description,
      loot: this.loot,
      datetimeMs: this.datetimeMs,
      message_id: this.messageID,
      // message_apps_id: this.messageAppID,
      event_role_id: this.role_id,
      guild_id: this.guildID,
      isRandom: this.random,
    })
  }
}

export default Tournament
