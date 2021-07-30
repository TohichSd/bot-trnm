import Discord from 'discord.js'
import { env } from 'process'
import discordButtons from 'discord-buttons'
import commands from './commands/index.js'
import { GuildModel } from './db/dbModels.js'
import onGuildCreate from './controllers/onGuildCreate.js'
import onButtonClick from './controllers/onButtonClick.js'

const intents = new Discord.Intents([
  Discord.Intents.NON_PRIVILEGED,
  'GUILD_MEMBERS',
])
const client = new Discord.Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  ws: { intents },
})

discordButtons(client)

/**
 * Запускает бота
 * @return {Promise<any>}
 */
const start = async () => {
  if (env.D_TOKEN === undefined) throw new Error('Token is not defined')
  await client
    .login(env.D_TOKEN)
    .then(() => {
      if (env.NODE_ENV === 'development') console.log('Discord client ready!')
      setInterval(() => client.user.setActivity('!help'), 3 * 60 * 60 * 1000)
    })
    .catch(err => {
      throw err
    })
  if (client.user.id !== undefined) return true
  throw new Error('User is unavailable')
}

/**
 * Сообщает, является, ли пользователь администратором бота
 * @param userID
 * @param guildID
 * @return Promise<boolean>
 */
const isMemberAdmin = async (userID, guildID) => {
  const guild = await client.guilds.fetch(guildID)
  if (guild.ownerID === userID) return true
  const member = await guild.members.fetch(userID)
  if (member.hasPermission('ADMINISTRATOR')) return true
  const memberRoles = member.roles.cache
  const adminRoles = (await GuildModel.findOneByGuildID(guildID)).admin_roles
  const intersection = adminRoles.filter(roleID => memberRoles.has(roleID))
  return intersection.length > 0
}

/**
 * Возвращает список серверов, на которых находится участник в виде {id, name, icon}
 * @param {string} id - id участника
 * @return {Promise<Object[]>}
 */
const getUserGuilds = async id => {
  const promises = client.guilds.cache.map(async guild => {
    const members = await guild.members.fetch()
    if (members.find(member => member.id === id))
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
      }
    return null
  })
  return Promise.all(promises)
}

/**
 * Отправляет отчёт пользовательлю с id == SUPERUSER_ID
 * @param {string} err Сообщение
 */
const sendReport = err => {
  if (env.NODE_ENV === 'development') console.error(err)
  else
    client.users
      .fetch(env.SUPERUSER_ID)
      .then(user => {
        user.send(err)
      })
      .catch(console.error)
}

/**
 *
 * @param {string} guildID ID сервера
 * @param {string} channelID ID канала
 */
const getChannel = async (guildID, channelID) => {
  const guild = await client.guilds.fetch(guildID)
  return guild.channels.cache.find(channel => channel.id === channelID)
}

const getGuildMember = async (userID, guildID) => {
  const guild = await client.guilds.fetch(guildID)
  return guild.members.fetch(userID)
}

const digitStrings = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  '-': 'heavy_minus_sign',
}

/**
 * @param {Number} num
 * @return {Promise}
 */
const numberToEmojis = async num => 
  (await Promise.all(
    num
      .toString()
      .split('')
      .map(digit => `:${digitStrings[digit]}:`)
  )).join().replace(/,/g, ' ')

//-----------------------------------------
// Обработчики событий

client.on('message', async message => {
  if (message.author.bot) return
  const cmd = message.content.slice(1).split(' ')[0].toLowerCase()
  let permissions = 0
  if (await isMemberAdmin(message.member.id, message.guild.id)) permissions = 1
  if (commands[cmd]) {
    if(commands[cmd].permissions === undefined) commands[cmd].permissions = 0
    if (commands[cmd].permissions > permissions) {
      await message.reply('Ты не можешь выполнять эту команду!')
      return
    }
    commands[cmd].run(message, permissions).catch(err => {
      if (err.message === 'Invalid syntax' && commands[cmd].syntax)
        message.reply(
          `Неверная команда! Использование: ${commands[cmd].syntax}`
        )
      else {
        message.reply(err.customMessage || 'Ошибка')
        sendReport(err)
      }
    })
  }
})

// client.on('messageReactionAdd', onReactionAdd)
// client.on('messageReactionRemove', onReactionRemove)
client.on('guildCreate', onGuildCreate)

client.on('clickButton', onButtonClick)

export {
  start,
  getUserGuilds,
  sendReport,
  isMemberAdmin,
  getChannel,
  getGuildMember,
  numberToEmojis,
}
