/**
 * @module site
 */

/**
 *
 * @param {object} message Сообщение
 */
const main = async (message) => {
  message.channel.send("https://arm-bot.eu.openode.io")
}

export default {
  name: "сайт",
  run: main,
  description: "Панель управления",
  permissions: 1,
}
