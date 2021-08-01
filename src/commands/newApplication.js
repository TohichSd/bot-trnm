import { promises } from 'fs'
import { sendReport } from '../bot.js'
import Interview from '../controllers/Interview.js'
import { ApplicationModel, GuildModel } from '../db/dbModels.js'

const main = async message => {
  const guildDB = await GuildModel.findOneByGuildID(message.guild.id)
  if(message.channel.id !== guildDB.new_app_channel) {
    const errMgs = await message.channel.send(
      `<@${message.author.id}>, Пожалуйста, заполняйте заявку только в канале <#${guildDB.new_app_channel}>`
    )
    setTimeout(() => {
      errMgs.delete()
    }, 11000)
    return
  }
  const questions = JSON.parse(
    await promises
      .readFile('src/config/application_questions.json')
      .then(data => data.toString())
      .catch(sendReport)
  )
  if(questions === undefined) return
  const interview = new Interview(
    questions,
    message.channel,
    message.author.id,
    'Создание заявки'
  )
  const answers = await interview.start().catch(err => {
    if (err._array === null) message.reply('Время на заполнение заявки вышло.')
    else if (err.message === 'Stop') message.reply('Отменено.')
    else sendReport(err.stack)
  })
  await ApplicationModel.updateOne(
    { id: message.member.id },
    { $set: { ...answers, id: message.member.id } },
    { upsert: true }
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
