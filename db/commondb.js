import MongoClient from 'mongodb'
import {env} from 'process'

const DAccess = {}
const dbname = env.DB_NAME


const connect = async () => {
    const client = await MongoClient.connect(env.CONNECTION_STRING, {useUnifiedTopology: true})
        .catch(err => {
            throw err
        })
    if (!client) throw new Error('Could not connect to database')
    return client
}


/**
 * Возвращает параметры сервера по id
 * @param {Object} query
 * @param {String} table
 * @return {Promise<void>}
 */
DAccess.get = async (query, table) => {
    const client = await connect()
    try {
        const db = client.db(dbname)
        const collection = db.collection(table)
        return await collection.findOne(query)
            .catch(err => {
                throw err
            })
    } finally {
        await client.close()
    }
}

/**
 * Задаёт параметры сервера по id
 * @param {Object} query
 * @param {String} table
 * @param {Object} params
 * @return {Promise<void>}
 */
DAccess.update = async (query, table, params) => {
    const client = await connect()
    try {
        const db = client.db(dbname)
        const collection = db.collection(table)
        await collection.updateOne(query, params)
            .catch(err => {
                throw err
            })
    } finally {
        await client.close()
    }
}

/**
 * Добавить новый сервер в бд
 * @param params
 * @param {String} table
 * @param {Object} params
 * @return {Promise<void>}
 */
DAccess.add = async (table, params) => {
    const client = await connect()
    try {
        const db = client.db(dbname)
        const collection = db.collection(table)
        await collection.insertOne(params)
            .catch(err => {
                throw err
            })
    } finally {
        await client.close()
    }
}

export default DAccess