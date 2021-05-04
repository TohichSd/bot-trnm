import { promises } from 'fs'
import DAccess from '../db/commonUtils.js'
import { sendReport } from '../bot.js'
import Interview from '../controllers/Interview.js'

const main = async message => {
  const questions = JSON.parse(
    await promises
      .readFile('config/application_questions.json')
      .then(data => data.toString())
  )
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
  await DAccess.updateOne(
    'applications',
    { guild_id: message.guild.id },
    { $set: { ...answers, guild_id: message.guild.id, id: message.author.id } }
  ).catch(sendReport)
}

export default {
  run: main,
  name: 'заявка',
  permissions: 0,
  description: 'Заполнить заявку',
}
