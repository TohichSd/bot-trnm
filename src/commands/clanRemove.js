import { ClanModel } from '../db/dbModels.js'

const main = async message => {
  if (message.mentions.roles.size < 1) {
    throw new Error('Invalid syntax')
  }
  const result = await ClanModel.removeClanByRole(
    message.mentions.roles.first().id
  ).catch(err => {
    throw err
  })
  if (result.deletedCount === 0) message.reply('Такого клана нет!')
  else await message.react('✅')
}

export default {
  run: main,
  name: 'удалить-клан',
  description: 'Удалить клан',
  syntax: '!удалить-клан < клановая роль >',
  permissions: 1,
}
