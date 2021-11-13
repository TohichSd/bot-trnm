import { MessageEmbed } from 'discord.js'
import options from '../config/random_props.js'

/**
 * Генерирует случайные параметры игры
 * @param {object} message Сообщение
 */
const main = async message => {
  message.delete()
  const embed = new MessageEmbed()
  const promises = Object.keys(options).map(ctg => {
    const randomElement =
      options[ctg][Math.floor(Math.random() * options[ctg].length)]
    embed.addField(ctg, randomElement)
    return randomElement
  })
  Promise.all(promises).then(() => {
    message.channel.send(embed)
  })
}

export default {
  name: 'рандом',
  run: main,
  description: 'Получить случайные параметры для турнира',
  showhelp: true,
  permissions: 1,
}
