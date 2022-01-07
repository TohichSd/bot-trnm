import cachegoose from 'cachegoose'
import {sendReport} from '../bot.js'
import Interview from '../controllers/Interview.js'
import {ApplicationModel, GuildModel} from '../db/models.js'
import questions from '../config/application_questions.js'

/**
 * @param {module:"discord.js".Message} message
 * @return {Promise<void>}
 */
const main = async message => {
  const guildDB = await GuildModel.findOneByGuildID(message.guild.id)
  if (message.channel.id !== guildDB.new_app_channel) {
    const errMgs = await message.channel.send(
      `<@${message.author.id}>, Пожалуйста, заполняйте заявку только в канале <#${guildDB.new_app_channel}>`
    )
    setTimeout(() => {
      errMgs.delete()
    }, 11000)
    return
  }
  const interview = new Interview(
    questions,
    message.channel,
    message.author.id,
    'Создание заявки'
  )
  let answers
  try {
    answers = await interview.start()
  } catch (err) {
    if (err._array === null) {
      message.reply('Время на заполнение заявки вышло.')
      return
    }
    if (err.message === 'Stop') {
      message.reply('Отмена')
      return
    }
    throw err.stack
  }
  await cachegoose.clearCache(`application/${message.member.id}`)
  await ApplicationModel.updateOne(
    {id: message.member.id},
    {
      $set: {
        level: answers.level.content,
        micro: answers.micro.content,
        link: answers.link.content,
        id: message.member.id
      }
    },
    {upsert: true}
  )
    .exec()
    .then(() => {
      message.reply('Заявка создана!')
    })
    .catch(err => {
      message.reply('Ошибка')
      sendReport(err)
    })
}

export default {
  run: main,
  name: 'заявка',
  permissions: 0,
  description: 'Заполнить заявку',
}
