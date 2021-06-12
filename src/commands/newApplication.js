import { promises } from 'fs'
import { sendReport } from '../bot.js'
import Interview from '../controllers/Interview.js'
import { ApplicationModel } from '../db/dbModels.js'

const main = async message => {
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
    { $set: { ...answers, guild_id: message.guild.id, id: message.member.id } },
    { upsert: true }
  )
    .exec()
    .then(() => {
      message.react('✅')
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
