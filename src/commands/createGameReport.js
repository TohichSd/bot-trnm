import moment from "moment-timezone";
import {MessageEmbed} from "discord.js";
import randomColor from 'randomcolor'
import Interview from "../controllers/Interview.js";
import {GameReportModel, GuildModel} from "../db/models.js";
import {getChannel} from "../bot.js";

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
      {stop: '!отмена', timeout: 300000, deleteQuestions: true})

    // Валидация ответов
    answers = await interview.start()
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
      await answers.image.delete()
      await answers.members.delete()
      await answers.winner.delete()
    }
  }
  await answers.members.delete()
  await answers.winner.delete()


  const game_members = await Promise.all(answers.members.mentions.members.map(mention => mention.id))
  game_members.push(message.member.id)

  // Документ для бд
  const doc = new GameReportModel({
    author: message.member.id,
    members: game_members,
    winner: answers.winner.mentions.members.first().id,
    datetimeMs: moment().tz('Europe/Moscow').valueOf(),
    message_id: 0,
  })
  await doc.save()

  const guild = await GuildModel.findOneByGuildID(message.guild.id)

  // канал для хранения скринов
  const imageChannel = await getChannel(message.guild.id, guild.game_report_images_channel)

  // Embed
  let members_string = `:first_place:<@${doc.winner}>:first_place:`
  await Promise.all(doc.members.map(id => {
    if (id !== doc.winner)
      members_string += `\n:game_die:<@${id}>:game_die:`
  }))

  const color = randomColor({
    luminosity: 'light'
  })

  const embedReport = new MessageEmbed()
    .setTitle(`**Рейтинговая игра** ${moment().tz('Europe/Moscow').format('DD.MM.YYYY HH:mm')}`)
    .addField('Участники:', members_string)
    .addField('\u200b', `Создано участником <@${doc.author}>`)
    .setFooter('Поздравляем победителя! Победа будет засчитана в ближайшее время!')
    .setColor(color)

  // Отправка скрина для хранения
  await imageChannel.send({files: [answers.image.attachments.first().url]})
    .then(m => {
      embedReport.setImage(m.attachments.first().url)
    })

  await answers.image.delete()

  await message.channel.send(embedReport)
  await message.delete()
}

export default {
  run: main,
  name: 'рейтинг',
  description: 'Сообщить о проведении рейтинговой игры'
}