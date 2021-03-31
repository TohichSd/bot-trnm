import Discord from "discord.js"
import {env} from "process"
import {DAccess} from '../db/commondb.js'

const client = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']})

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
 * Находит участника и возвращает
 * @param {string} id - id участника
 * @return {boolean}
 */
const isMemberAdmin = async (id) => {
    // eslint-disable-next-line no-restricted-syntax
    for await (const guild of client.guilds.cache) {
        const result = await DAccess.guild.get(guild[1].id)
            .catch(console.err)
        if (result.rows[0].permissions[id] > 1 || id === guild[1].ownerID || id === env.SUPERUSER_ID && id !== undefined && id !== "") return true
    }
    return false
}


export {start, isMemberAdmin}

