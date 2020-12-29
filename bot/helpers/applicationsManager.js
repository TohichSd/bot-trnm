/**
 * @module Applications-Manager
 */
import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"

const logger = new winston_logger(dfname.dirfilename(
    import.meta.url), true)

/**
 * Возвращает роль участника с сервера, id которого равно guild_id с member.id = id
 * @param {string} guild_id ID сервера
 * @param {string} id member.id
 * @returns {Promise<object>} Результат
 */
function get(guild_id, id) {
    return new Promise((resolve, reject) => {
        DAO.all(`SELECT * FROM applications WHERE guild_id = $guild_id AND id = $id`, {
                $id: id,
                $guild_id: guild_id
            })
            .then(row => {
                resolve(row)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * Возвращает роли всех участников сервера с guild.id = guild_id
 * @param {string} guild_id ID сервера
 */
function getAll(guild_id) {
    return new Promise((resolve, reject) => {
        DAO.all(`SELECT * FROM applications WHERE guild_id = $guild_id`, {
                $guild_id: guild_id,
            })
            .then(row => {
                resolve(row)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * Добавить заявку участника в бд
 * @param {string} guild_id ID сервера
 * @param {string} id ID участника
 * @param {string} link Ссылка на steam участника
 * @param {number} level Уровень участника
 * @param {number} age Возраст участника
 * @param {string} micro Есть ли у участника микрофон
 */
function set(id, guild_id, link, level, age, micro) {
    return new Promise((resolve, reject) => {
        DAO.get(`SELECT * FROM applications WHERE guild_id = $guild_id AND id = $id`, {
                $guild_id: guild_id,
                $id: id,
            })
            .then(row => {
                if (row == undefined || row == null) {
                    DAO.run(`INSERT INTO applications (id, guild_id, link, level, age, micro) VALUES ($id, $guild_id, $link, $level, $age, $micro)`, {
                            $id: id,
                            $guild_id: guild_id,
                            $link: link,
                            $level: level,
                            $age: age,
                            $micro: micro
                        })
                        .then(() => logger.debug("Application set"))
                        .catch(err => logger.warn(err.stack))
                    resolve()
                } else {
                    DAO.run(`UPDATE applications SET id = $id, guild_id = $guild_id, link = $link, level = $level, age = $age, micro = $micro WHERE id = $id AND guild_id = $guild_id`, {
                            $id: id,
                            $guild_id: guild_id,
                            $link: link,
                            $level: level,
                            $age: age,
                            $micro: micro
                        })
                        .then(() => logger.debug("Application updated"))
                        .catch(err => logger.warn(err.stack))
                    resolve()
                }
            })
            .catch(err => {
                logger.warn(err);
                reject(err)
            })
    })
}


export default {
    get: get,
    set: set,
    getAll: getAll,
    name: "applicationManager"
}