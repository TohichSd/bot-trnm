import { MessageEmbed } from 'discord.js'
import moment from 'moment'
import { MemberModel, GuildModel } from '../db/dbModels.js'
import { getChannel, numberToEmojis, sendReport } from '../bot.js'

let lastUpdateTime = 0
let updatePromised = false

const update = async guildID => {
  lastUpdateTime = moment().valueOf()
  updatePromised = false
  const guildDB = await GuildModel.findOneByGuildID(guildID)
  let guildMembersDB = await MemberModel.getAllGuildMembers(guildID)
  const embedMembers = new MessageEmbed()
    .setTitle('Таблица участников')
    .setColor('#f6cf36')
  // .setImage('https://www.freeiconspng.com/uploads/red-line-png-0.png')

  if (guildMembersDB.length > 0) {
    const maxWins = Math.max(...guildMembersDB.map(o => o.wins))
    guildMembersDB.sort(
      (a, b) =>
        (2 * b.wins) / maxWins * (b.wins / b.games) - (2 * a.wins) / maxWins * (a.wins / a.games)
    )
    guildMembersDB = guildMembersDB.slice(0, 25)
    await Promise.all(
      guildMembersDB.map(async (mdb, i) => {
        let medal
        if (i === 0) medal = ':first_place:'
        else if (i === 1) medal = ':second_place:'
        else if (i === 2) medal = ':third_place:'
        else medal = ':medal:'
        embedMembers.addField(
          '\u200b',
          `${i < 3 ? medal : await numberToEmojis(i + 1)} <@${
            mdb.id
          }>\n:trophy: Победы: ${mdb.wins}\n:game_die: Всего игр: ${mdb.games}`,
          true
        )
      })
    )
  } else embedMembers.setDescription('Здесь будет таблица рейтинга')

  if (guildDB.score_table_channel === undefined) {
    sendReport('Score table channel is not defined')
  }
  const stChannel = await getChannel(guildID, guildDB.score_table_channel)

  if (guildDB.score_table_message_id !== undefined) {
    try {
      const message = await stChannel.messages.fetch(
        guildDB.score_table_message_id
      )
      await message.edit(embedMembers)
    } catch (err) {
      sendReport(err)
    }
  } else {
    try {
      const msg = await stChannel.send(embedMembers)
      await guildDB.setScoreTableMessageID(msg.id)
    } catch (err) {
      sendReport(err)
    }
  }
}

export default guildID => {
  if (updatePromised) return
  if (moment().valueOf() - lastUpdateTime < 15000) {
    setTimeout(() => {
      update(guildID)
    }, 15000 - moment().valueOf() + lastUpdateTime)
    updatePromised = true
  } else update(guildID)
}
