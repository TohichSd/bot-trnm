import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import discordButtons from 'discord-buttons'
import { EventModel } from '../db/models.js'
import { sendReport } from '../bot.js'
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
    this.datetimeMs = moment(datetime).valueOf() + 1000 * 60 * 35 // на турнир можно зарегистрироваться ещё спустя 35 мин после начала
    this.random = random
    this.guildID = guildID
    this.datetimeFormated = moment(datetime).locale('ru').format('LLLL') + 'по МСК'
  }

  /**
   * @param channelT канал с туринрами
   * @param channelA канал с заявками
   * @return {Promise<void>}
   */
  async send(channelT, channelA) {
    const messageT = new MessageEmbed()
      .setColor(strings.color)
      .setTitle(`**${this.name.toUpperCase()}**`)
      .setDescription(strings.descriptionHeader)
      .addField(strings.description, this.description, true)
      .addField(strings.loot, this.loot)
      .addField(strings.datetime, this.datetimeFormated)
      .setAuthor(
        this.random ? strings.newTRandom : strings.newT,
        strings.authorIcon
      )
      .setImage(strings.image)
      .setFooter(strings.footer)
      // .setThumbnail(strings.thumbnail)
    
    const button = new discordButtons.MessageButton()
      .setLabel('ПРИНЯТЬ УЧАСТИЕ')
      .setStyle('green')
      .setID('trnm')
    
    await channelT.send(messageT, button).then(msg => {
      this.messageID = msg.id
      this.guildID = msg.guild.id
    })

    const messageA = new MessageEmbed()
      .setColor('#4287f5')
      .setTitle(`Участники турнира ${this.name}`)
      .setDescription('Здесь появятся участники турнира.')
    
    await channelA.send(messageA).then(msg => {
      this.messageAppID = msg.id
      this.guildAppID = msg.guild.id
    })
    
    // Создание роли турнира
    await channelA.guild.roles.create({ data: {name: `Участник турнира "${this.name}"`, color: '#4287f5'} })
      .then(role => { 
        this.role_id = role.id
        const dtMs = this.datetimeMs - moment().tz('Europe/Moscow').valueOf() + 3 * 60 * 1000
        setTimeout(() => {
          role.delete()
        }, dtMs)
      })
      .catch(sendReport)
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
      message_apps_id: this.messageAppID,
      event_role_id: this.role_id,
      guild_id: this.guildID,
    })
    await Event.save()
  }
}

export default Tournament
