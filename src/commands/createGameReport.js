import Interview from "../controllers/Interview.js";
import {GameReportModel} from "../db/models.js";
import moment from "moment";
import {MessageEmbed} from "discord.js";

const main = async message => {
  let valid = false
  let answers
  while (!valid) {
    const interview = new Interview(
      {
        members: 'Кто участвовал? Напишите ответ, @упомянув всех участников **(кроме себя)** в одном сообщении.',
        winner: 'Кто выиграл? Напишите ответ, @упомянув участника.',
        image: 'Отправьте скрин.'
      },
      message.channel,
      message.member.id,
      'Заполнение отчёта',
      {
        stop: '!отмена',
        timeout: 300000,
        deleteQuestions: true
      })
    answers = await interview.start()
    if (answers.members.mentions.members.size === 3) {
      if (answers.winner.mentions.members.size === 1) {
        valid = true
      } else {
        const m = await message.channel.send('Победитель должен быть один! Давайте заново.')
        setTimeout(() => {
          m.delete()
        }, 15000)
      }
    } else {
      const m = await message.channel.send('Неверное количество участников. Давайте заново.')
      setTimeout(() => {
        m.delete()
      }, 15000)
    }
    if (answers.members.mentions.members.size === 3
      && answers.winner.mentions.members.size === 1
      && answers.image.attachments.size === 1) {
      valid = true
    } else {
      message.reply('Неверное заполнение. Пожалуйста, ответьте на вопросы заново или напишите !отмена')
        .then(m => {
          setTimeout(() => {
            m.delete()
          }, 10000)
        })
    }
  }

  const game_members = await Promise.all(answers.members.mentions.members.map(mention => mention.id))
  game_members.push(message.member.id)
  const doc = new GameReportModel({
    author: message.member.id,
    members: game_members,
    winner: answers.winner.mentions.members.first().id,
    datetimeMs: moment().valueOf(),
    message_id: 0,
  })
  await doc.save()

  let members_string = `:trophy:<@${doc.winner}>:trophy:`
  await Promise.all(doc.members.map(id => {
    if (id !== doc.winner)
      members_string += `\n:game_die:<@${id}>:game_die:`
  }))


  const embedReport = new MessageEmbed()
    .setTitle(`**Рейтинговая игра** ${moment().format('DD.MM.YYYY HH:mm')}`)
    .addField('Участники:', members_string)
    .addField('\u200b', `Создано участником <@${doc.author}>`)
    .setFooter('Поздравляем победителя! Победа будет засчитана в ближайшее время!')
    .setThumbnail(answers.image.attachments.first().url)
    .setColor('#782b9e')


  await message.channel.send(embedReport)
  await message.delete()
}

export default {
  run: main,
  name: 'рейтинг',
  description: 'Сообщить о проведении рейтинговой игры'
}