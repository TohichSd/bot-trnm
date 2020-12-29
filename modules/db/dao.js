/** @module dao */

import sqlite3 from 'sqlite3'
import winston_logger from "../logger/index.js"
import dfname from "../../utils/__dfname.js"

const logger = new winston_logger(dfname.dirfilename(
    import.meta.url), true)


/**
 * Доступ к базе данных sqlite3
 */
class DAO {
    /**
     * Создать DAO
     * @param {string} path Путь к файлу бд
     */
    constructor(path = undefined) {
        if (path)
            this.open(path)
    }
    /**
     * Открыть соединение с бд
     * @param {string} path Путь к файлу бд
     * @return {Promise} результат
     */
    open(path) {
        if (path)
            this.db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE, (err) => {
                if (err)
                    logger.warn(err.stack)
                else logger.info(`Connected to database`)
            })
        else logger.warn("path cannot be null / undefined")
    }
    /**
     * Выполнить метод sqlite3.all
     * @param {string} text SQL запрос
     * @returns {Promise<object[]>} Результат
     */
    async all(text, params = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.db.serialize(() => {
                    this.db.all(text, params, (err, row) => {
                        if (err) logger.warn(err.stack)
                        resolve(row)
                    })
                })

            } catch (err) {
                logger.warn(err.stack)
                reject(err)
            }
        })
    }

    /**
     *Выполнить метод sqlite3.get
     * @param {string} text SQL запрос
     * @return {Promise<object>} Результат
     */
    async get(text, params = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.db.serialize(() => {
                    this.db.get(text, params, (err, row) => {
                        if (err) logger.warn(err.stack)
                        resolve(row)
                    })
                })

            } catch (err) {
                logger.warn(err)
                reject(err)
            }
        })
    }

    /**
     * Выполнить метод sqlite3.run
     * @param {string} text SQL запрос
     * @return {Promise<object>} Результат
     */
    async run(text, params = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.db.serialize(() => {
                    this.db.run(text, params, (err) => {
                        if (err) {
                            logger.warn(err.stack)
                            reject(err)
                        }
                        resolve()
                    })
                })
            } catch (err) {
                logger.warn(err.stack)
                reject(err)
            }

        })
    }

    /**
     * Закрыть соединение с бд
     * @returns {Promise<any>} Результат
     */
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (!err) resolve()
                else reject(err)
            })
        })
    }
}
// const dao = new DAO("databases/database.db")
// dao.all("SELECT * FROM system;")
//     .then(row => {
//         console.dir(row)
//     })
// dao.get("SELECT * FROM system;")
//     .then(row => {
//         console.dir(row)
//     })
export default new DAO("databases/database.db")