import { ClanModel } from '../db/dbModels.js'

const main = async message => {
  const args = message.content.split(' ')
  if (args.length < 2) {
    throw new Error('Invalid syntax')
  }
  const result = await ClanModel.removeClanByName(args[1]).catch(err => {
    throw err
  })
  if (result.deletedCount === 0) message.reply('Такого клана нет!')
  else message.reply('Готово!')
}

export default {
  run: main,
  name: 'удалить-клан',
  description: 'Удалить клан',
  syntax: '!удалить-клан < название клана >',
  permissions: 1,
}
