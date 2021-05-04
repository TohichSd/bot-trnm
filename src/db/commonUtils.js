import MongoClient from 'mongodb'
import { env } from 'process'

const dbname = env.DB_NAME

class DBUtils {
  /**
   * Выполняет подключение к бд
   * @return {Promise<MongoClient>}
   */
  static async connect() {
    const client = await MongoClient.connect(env.CONNECTION_STRING, {
      useUnifiedTopology: true,
    }).catch(err => {
      throw err
    })
    if (!client) throw new Error('Could not connect to database')
    return client
  }

  /**
   * Возвращает документ
   * @param {Object} query
   * @param {String} table
   * @return {Promise<void>}
   */
  static async findOne(table, query) {
    const client = await this.connect()
    try {
      const db = client.db(dbname)
      const collection = db.collection(table)
      return await collection.findOne(query).catch(err => {
        throw err
      })
    } finally {
      await client.close()
    }
  }

  /**
   * Изменяет документ
   * @param {Object} query
   * @param {String} table
   * @param {Object} params
   * @return {Promise<void>}
   */
  static async updateOne(table, query, params) {
    const client = await this.connect()
    try {
      const db = client.db(dbname)
      const collection = db.collection(table)
      await collection.updateOne(query, params).catch(err => {
        throw err
      })
    } finally {
      await client.close()
    }
  }

  /**
   * Изменяет несколько документов
   * @param {Object} query
   * @param {String} table
   * @param {Object} params
   * @return {Promise<void>}
   */
  static async updateMany(table, query, params) {
    const client = await this.connect()
    try {
      const db = client.db(dbname)
      const collection = db.collection(table)
      await collection.updateMany(query, params).catch(err => {
        throw err
      })
    } finally {
      await client.close()
    }
  }

  /**
   * Добавляет документ
   * @param params
   * @param {String} table
   * @param {Object} params
   * @return {Promise<void>}
   */
  static async insertOne(table, params) {
    const client = await this.connect()
    try {
      const db = client.db(dbname)
      const collection = db.collection(table)
      await collection.insertOne(params).catch(err => {
        throw err
      })
    } finally {
      await client.close()
    }
  }
}

export default DBUtils
