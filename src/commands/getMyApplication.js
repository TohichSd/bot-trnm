import { MessageEmbed } from 'discord.js'
import { ApplicationModel } from '../db/dbModels.js'

const main = async message => {
  const application = await ApplicationModel.findOneByID(message.member.id)
  const embed = new MessageEmbed()
    .setTitle(`Заявка участника ${message.member.displayName}`)
    .addField(':link: Ссылка на steam:', application.link)
    .addField(':video_game: Уровень в игре:', application.level)
    .addField(':man_mage: Возраст:', application.age)
    .addField(':microphone2: Наличие микрофона:', application.micro)
    .setThumbnail('https://i.ibb.co/1Q7pQ94/podacha.png')
    .setColor('#37bbe0')
  message.reply(embed)
}

  export default {
    run: main,
    name: 'моя-заявка',
    permissions: 0,
    description: 'Посмотерть свою заявку',
  }