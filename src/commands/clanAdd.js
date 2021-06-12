import { ClanModel } from '../db/dbModels.js'
import Interview from '../controllers/Interview.js'

const main = async message => {
  const interview = new Interview(
    {
      name: 'Как клан будет называться?',
      role: 'Какая роль будет принадлижать клану',
    },
    message.channel,
    message.member.id,
    'Создать новый клан',
    {
      mentions: ['role'],
    }
  )
  const answers = await interview.start()
  if (answers.role.roles.size !== 1) {
    await message.reply('Клану должна принадлежать одна роль!')
    return
  }
  await new ClanModel({
    name: answers.name,
    role_id: answers.role.roles.first().id,
    guild_id: message.guild.id,
  })
    .save()
    .catch(err => {
      if (err.code === 11000)
        err.customMessage =
          'Каждая роль может использоваться только для одного клана!'
      throw err
    })
  await message.react('✅')
}

export default {
  run: main,
  name: 'клан',
  description: 'Добавить новый клан',
  permissions: 1,
}
