import Discord from "discord.js"
import {env} from "process"

const intents = new Discord.Intents([Discord.Intents.NON_PRIVILEGED ,"GUILD_MEMBERS"])
const client = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION'], ws: {intents}})

/**
 * Запускает бота
 * @return {Promise<any>}
 */
const start = async () => {
    if (env.DSTOKEN === undefined) throw new Error("Token is not defined")
    await client.login(env.DSTOKEN)
        .then(() => {
            console.log("Discord client ready!")
            setInterval(() => client.user.setActivity("!help"), 3 * 60 * 60 * 1000)
        })
        .catch(err => {
            throw err
        })
    if (client.user.id !== undefined) return true
    throw new Error('Unexpected error: user is unavailable')
}


// Common

/**
 * Возвращает роль участника
 * @param {string} id - id участника
 * @return {Promise<Object[]>}
 */
const getUserGuilds = async (id) => {
    // eslint-disable-next-line no-restricted-syntax
    const promises = client.guilds.cache.map(async guild => {
        const members = await guild.members.fetch()
        if(members.find(member => member.id === id)) return {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL()
        }
        return null
    })
    return Promise.all(promises)
}

/**
 * Отправляет отчёт пользовательлю с id == SUPERUSER_ID
 * @param err
 */
const sendReport = (err) => {
  client.users
    .fetch(env.SUPERUSER_ID)
    .then((user) => {
      user.send(err)
    })
    .catch(console.error)
}

/**
 * Сообщает, является, ли пользователь администратором бота
 * @param userID
 * @param guildID
 * @return Promise<boolean>
 */
const isMemberAdmin = async (userID, guildID) => {
  const guild = await client.guilds.fetch(guildID)
  if(guild.ownerID === userID) return true
  const memberRoles = (await guild.members.fetch(userID)).roles.cache
  const adminRoles = (await DB.get("guilds", { guild_id: guildID })).admin_roles
  const intersection = adminRoles.filter(role => memberRoles.has(role))
  return intersection.length > 0
}

export { start, getUserGuilds, sendReport, isMemberAdmin }
