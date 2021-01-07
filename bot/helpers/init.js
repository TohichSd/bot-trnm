/**
 * @module init
 */
import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"
import userPermissions from "../helpers/userPermissions.js"

const logger = new winston_logger(dfname.dirfilename(
    import.meta.url), true)

// console.log = function() {}
// console.error = function() {}
/**
 * Добавить сервер в базу данных
 * @param {object} guild Сервер для инициализации
 */
function main(guild) {
    DAO.get(`SELECT * FROM guilds WHERE guild_id = '${guild.id}'`)
        .then((rowSelect) => {
            if (rowSelect === undefined) {
                DAO.run(`INSERT INTO guilds (guild_id) VALUES (${guild.id})`)
                    .then(() => logger.info("Guild added to db"))
                    .catch((error) => {
                        logger.warn(error.stack)
                    })
                userPermissions.set(guild.id, 1, guild.ownerID)
                    .catch(err => logger.warn(err.stack))
            } else {
                logger.warn("The server has already been initialized")
            }
        })
        .catch(err => logger.warn(err.stack))
}

/**
 * Проверить наличие сервера в бд и в случае отстутствия запростить ключ
 * @param {object} msg
 * @param {boolean} init
 * @param {string} key
 */
function check(guild) {
    return new Promise((resolve, reject) => {
        try {
            DAO.get(`SELECT * FROM guilds WHERE guild_id = '${guild.id}'`)
                .then(rowSelect => {
                    if (rowSelect === undefined) {
                        resolve(false)
                    }
                    else {
                        resolve(true)
                    }
                })
        }
        catch (err) {
            reject(err)
            logger.warn(err)
        }

    })

}

export default {
    run: main,
    check: check,
    name: 'init'
}