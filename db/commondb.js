import pg from 'pg'
import QueryBuilder from "./QueryBuilder.js";

const pool = new pg.Pool()
const DAccess = {}
const query = new QueryBuilder()

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

DAccess.guild = {}

/**
 * Возвращает информацию о guild по его id
 * @param {string} id ID сервера
 * @return {Promise<Object>}
 */
DAccess.guild.get = async (id = '') => {
    const client = await pool.connect()
    try {
        query.select('guilds', ['*'], {id})
        return await client.query(query.queryString, query.queryParams)
    } finally {
        client.release()
    }
}

/**
 * Добавляет или обновляет значение в таблице guilds
 * @param {string} id
 * @param {object} params
 * @return {Promise<void>}
 */
DAccess.guild.set = async (id, params) => {
    const client = await pool.connect()
    try {

        query.select('guilds', ['*'], {id})
        const tmpResult = await client.query(query.queryString, query.queryParams)

        if (params.permissions === undefined) params.permissions = tmpResult.rows[0].permissions
        if (params.options === undefined) params.options = tmpResult.rows[0].options

        if (tmpResult.rowCount === 0) {
            query.insert('guilds', ['id', 'permissions', 'options'], [id, params.permissions, params.options])
            await client.query(query.queryString, query.queryParams)
        }
        else {
            query.update('guilds', ['id', 'permissions', 'options'], [id, params.permissions, params.options], {id})
            await client.query(query.queryString, query.queryParams)
        }
    } finally {
        client.release()
    }
}

DAccess.guild.get("663333255855996929")
    .then(console.dir)

export {DAccess, pool}