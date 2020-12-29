/**
 * @module Get-users-permissions
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
        DAO.all(`SELECT * FROM roles WHERE guild_id = $guild_id AND id = $id`, {
                $guild_id: guild_id,
                $id: id
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
        DAO.all(`SELECT * FROM roles WHERE guild_id = $guild_id`, {
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
 * Установить роль участника с member.id = id на сервере с guild.id = guild_id
 * @param {string} guild_id ID сервера
 * @param {number} permissions Новая роль
 * @param {string} id member.id
 */
function set(guild_id, permissions, id) {
    return new Promise((resolve, reject) => {
        DAO.get(`SELECT * FROM roles WHERE guild_id = $guild_id AND id = $id`, {
                $guild_id: guild_id,
                $id: id
            })
            .then(row => {
                if (row == undefined || row == null) {
                    DAO.run(`INSERT INTO roles (guild_id, role, id) VALUES ($guild_id, $permissions, $id)`, {
                            $guild_id: guild_id,
                            $permissions: permissions,
                            $id: id
                        })
                        .then(() => logger.debug("Role set"))
                        .catch(err => logger.warn(err.stack))
                    resolve()
                } else {
                    DAO.run(`UPDATE roles SET role = $permissions WHERE id = $id AND guild_id = $guild_id`, {
                            $guild_id: guild_id,
                            $permissions: permissions,
                            $id: id
                        })
                        .then(() => logger.debug("Role updated"))
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
    name: "permissions"
}