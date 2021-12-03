import { env } from 'process'

/**
 * @module site
 */

/**
 *
 * @param {object} message Сообщение
 */
const main = async message => {
  message.channel.send(env.SELF_URL)
}

export default {
  name: 'сайт',
  run: main,
  description: 'Панель управления',
  permissions: 1,
}
