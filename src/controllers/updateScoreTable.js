import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import { env } from 'process'
import { MemberModel, GuildModel } from '../db/models.js'
import { getChannel, numberToEmojis, sendReport } from '../bot.js'

// Время последнего обновления
let lastUpdateTime = 0
// Заланировано ли уже обновление
let updatePromised = false

const update = async guildID => {
  lastUpdateTime = moment().valueOf()
  updatePromised = false
  const guildDB = await GuildModel.findOneByGuildID(guildID)
  const guildMembersDB = await MemberModel.getBestGuildMembers(guildID)
  const embedMembers = new MessageEmbed()
    .setTitle('Таблица участников')
    .setColor('#f6cf36')

  if (guildMembersDB.length > 0) {
    // создать поля в embed
    await Promise.all(
      guildMembersDB.map(
        /**
         * @param {MemberModel} mdb
         * @param {Number} i
         * @return {Promise<void>}
         */
        async (mdb, i) => {
        // Если место меньше 4, то вместо числа - медаль
        let medal
        if (i === 0) medal = ':first_place:'
        else if (i === 1) medal = ':second_place:'
        else if (i === 2) medal = ':third_place:'
        embedMembers.addField(
          '\u200b',
          `${i < 3 ? medal : await numberToEmojis(i + 1)} <@${
            mdb.id
          }>\n:trophy: Победы: ${mdb.wins}\n:game_die: Всего игр: ${mdb.games}
          ${env.NODE_ENV === 'development' ? mdb.winIndex : ''}`,
          true
        )
      })
    )
  } else embedMembers.setDescription('Здесь будет таблица рейтинга')

  // Если канал для таблицы не задан
  if (guildDB.score_table_channel === undefined) {
    sendReport('Score table channel is not defined', guildID)
    return
  }
  const stChannel = await getChannel(guildID, guildDB.score_table_channel)

  // Если сообщение с таблицей существует, отредактировать его, в противном случае отправить новое
  if (guildDB.score_table_message_id !== undefined) {
    try {
      const message = await stChannel.messages.fetch(
        guildDB.score_table_message_id
      )
      await message.edit(embedMembers)
    } catch (err) {
      sendReport(err, guildID)
      const msg = await stChannel.send(embedMembers)
      await guildDB.setScoreTableMessageID(msg.id)
    }
  } else {
    try {
      const msg = await stChannel.send(embedMembers)
      await guildDB.setScoreTableMessageID(msg.id)
    } catch (err) {
      sendReport(err, guildID)
    }
  }
}

/**
 * Обновить таблицу рейтинга
 *
 * @param guildID
 */
export default guildID => {
  if (updatePromised) return
  if (moment().valueOf() - lastUpdateTime < 15000) {
    setTimeout(() => {
      update(guildID)
    }, 15000 - moment().valueOf() + lastUpdateTime)
    updatePromised = true
  } else update(guildID)
}

// Данная функция позволяет ограничить частоту обновления таблицы до 1 раза в 15 сек
// Если время с последнего обновления меньше 15000, то обновление будет исполено как только пройдут 15 сек.
// Также updatePromised устанавливается в true для того что бы не обновлять таблицу при каждом запросе
