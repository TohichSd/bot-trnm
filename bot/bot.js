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

//  const guild = _guild[1]
//  const member = await guild.members.fetch(id)
//  if(member !== undefined) guilds.push(guild.id)

export {start, getUserGuilds}