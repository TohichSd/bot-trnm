﻿import Discord from 'discord.js'
import { env } from 'process'
import commands from './commands/index.js'
import onReactionAdd from './controllers/onReactionAdd.js'
import onReactionRemove from './controllers/onReactionRemove.js'
import { GuildModel } from './db/dbModels.js'

const intents = new Discord.Intents([
  Discord.Intents.NON_PRIVILEGED,
  'GUILD_MEMBERS',
])
const client = new Discord.Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  ws: { intents },
})

/**
 * Запускает бота
 * @return {Promise<any>}
 */
const start = async () => {
  if (env.DSTOKEN === undefined) throw new Error('Token is not defined')
  await client
    .login(env.DSTOKEN)
    .then(() => {
      if (env.NODE_ENV === 'development') console.log('Discord client ready!')
      setInterval(() => client.user.setActivity('!help'), 3 * 60 * 60 * 1000)
    })
    .catch(err => {
      throw err
    })
  if (client.user.id !== undefined) return true
  throw new Error('Unexpected error: user is unavailable')
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
  const adminRoles = (await GuildModel.findOne({guild_id: guildID}).exec()).admin_roles
  const intersection = adminRoles.filter(roleID => memberRoles.has(roleID))
  return intersection.length > 0
}

client.on('message', message => {
  const cmd = message.content.slice(1).split(' ')[0].toLowerCase()
  if (commands[cmd]) {
    commands[cmd].run(message)
  }
})

client.on('messageReactionAdd', onReactionAdd)
client.on('messageReactionRemove', onReactionRemove)

// Common
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
  return guild.members.cache.find(member => member.id === userID)
}

export { start, getUserGuilds, sendReport, isMemberAdmin, getChannel, getGuildMember }