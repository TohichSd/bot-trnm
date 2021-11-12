import { MessageEmbed } from 'discord.js'
import { ApplicationModel } from '../db/models.js'

/**
 * 
 * @param {module:"discord.js".Message} message
 * @return {Promise<void>}
 */
const main = async message => {
  if (message.mentions.members.size !== 1)
    throw new Error('Invalid syntax')
  const member = message.mentions.members.first()
  const application = await ApplicationModel.findOneByID(member.id)
  if (application === null) {
    const errMgs = await message.channel.send(
      'У участника ещё нет заявки!'
    )
    setTimeout(() => {
      errMgs.delete()
    }, 11000)
    return
  }
  const embed = new MessageEmbed()
    .setTitle(`Заявка участника ${member.displayName}`)
    .addField(':link: Ссылка на steam:', application.link)
    .addField(':video_game: Уровень в игре:', application.level)
    .addField(':microphone2: Наличие микрофона:', application.micro)
    .setThumbnail('https://i.ibb.co/1Q7pQ94/podacha.png')
    .setColor('#37bbe0')
  await message.reply(embed)
}

export default {
  run: main,
  name: 'заявка-участника',
  permissions: 1,
  syntax: '!заявка-участника @участник',
  description: 'Получить заявку участника'
}