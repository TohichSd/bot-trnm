/**
 * @module init
 */
import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"
import userPermissions from "../helpers/userPermissions.js"

const logger = new winston_logger(dfname.dirfilename(
    import.meta.url), true)

/**
 * Добавить сервер в базу данных
 * @param {object} guild Сервер для инициализации
 */
function main(guild) {
    DAO.get(`SELECT * FROM guilds WHERE guild_id = '${guild.id}'`)
        .then((rowSelect) => {
            if (rowSelect == undefined || rowSelect == null) {
                DAO.run(`INSERT INTO guilds (guild_id) VALUES (${guild.id})`)
                    .then(logger.debug("Guild added to db"))
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
export default {
    run: main,
    name: 'init'
}