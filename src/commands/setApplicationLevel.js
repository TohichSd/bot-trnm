import { ApplicationModel } from '../db/dbModels.js'

const main = async message => {
  const args = message.content.replace(/ +(?= )/g, '').split(' ')
  if(!parseInt(args[1], 10)) throw new Error('Invalid syntax')
  const newLevel = parseInt(args[1], 10)
  try {
    const application = await ApplicationModel.findOneByID(message.member.id)
    await application.updateLevel(newLevel)
  }
  catch (err) {
    throw new Error('DB error')
  }
  await message.react('✅')
}

export default {
  run: main,
  name: 'уровень',
  permissions: 0,
  syntax: '!уровень [новое значение]',
  description: 'Изменить уровень с заявке',
}
