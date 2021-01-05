/** @module logger */

import winston from "winston"
import moment from "moment"

const {
    createLogger
} = winston

let d = moment().format("YYYY-MM-DD HH:mm:ss")
let ltsd = moment().format("HH:mm:ss")

/**
 * custom winston.js logger
 */
class Logger {
    /**
     * Конструктор
     * @param {String} moduleName Имя модуля для отображения в логах
     * @param {boolean} logToConsole Если false, то логи не будут выводиться в консоль
     * @return {Object} Экземпляр логгера
     */
    constructor(moduleName, logToConsole = false) {
        //отключение логгирования в консоль
        // logToConsole = false
        this.moduleName = moduleName
        this.logToConsole = logToConsole
        /**
         * @param {winston.Logger} logger Экземпляр логгера
         * @private
         */
        this.logger = createLogger()
    }

    /**
     * 
     * @param {string} level Уровень логгирования
     */
    custom_format(level) {
        return winston.format.combine(
            winston.format.align(),
            winston.format.label({
                label: this.moduleName
            }),
            winston.format.printf(msg => {
                return `[${ltsd}] [${level}] [${msg.label}]: ${msg.message}`
            }))
    }
    /** 
     * Возвращает winston.js transport для логгирования в общие файлы
     * @param {string} level Уровень логгирования
     * @private
     */

    all_log_transport(level) {
        return new winston.transports.File({
            filename: `log/${level}.log`,
        })
    }
    /** 
     * @param {string} level Уровень логгирования
     * @private
     * */

    module_log_transport(level) {
        return new winston.transports.File({
            filename: `log/${this.moduleName}/${level}/${level}-[${d}].log`,
        })
    }

    /** 
     * @param {string} level Уровень логгирования
     * @private
     * */

    log_console(level) {
        //отключение логгирования в консоль
        return new winston.transports.Console({
                format: this.custom_format(level)
            },
            winston.format.printf(msg => {
                winston.format.colorize().colorize(level, `[${ltsd}] [${level}] [${msg.label}]: ${msg.message}`)
            })
        )
    }

    /**
     * Создаёт winston.transport.file
     * @param {string} filepath путь к файлу
     * @returns new winston.transport.file
     * @private
     */

    customTransportFile(filepath) {
        return new winston.transports.File({
            filename: filepath,
        })
    }


    /**
     * Логгировать сообщение с уровнем "info"
     * @param {string} msg Сообщение
     * @param {object} params Параметры логгера
     * @param {boolean} params.console Если false, не сообщение не будет выведено в консоль
     * @param {string[]} params.files Список дополнительных файлов
     * @returns {Promise} Promise
     * @public
     */

    async info(msg, params = {
        console: true,
        files: []
    }) {
        const level = 'info'
        return this.log(level, msg, params)
    }


    /**
     * Логгировать дебаг-информацию
     * @param {string} msg Сообщение
     * @param {object} params Параметры
     * @param {boolean} params.console Если false, не сообщение не будет выведено в консоль
     * @param {string[]} params.files Список дополнительных файлов
     * @returns {Promise} Promise
     * @public
     */

    async debug(msg, params = {
        console: true,
        files: []
    }) {
        const level = 'debug'
        return this.log(level, msg, params)
    }



    /**
     *Логгировать ошибку
     * @param {String} msg Ошибка
     * @param {{console: boolean}} params Параметры
     * @param {boolean} params.console Если false, не сообщение не будет выведено в консоль
     * @param {string[]} params.files Список дополнительных файлов
     * @returns {Promise} Promise
     * @public
     */

    async warn(msg, params = {
        console: true,
        files: []
    }) {
        const level = 'warn'
        return this.log(level, msg, params)
    }



    /**
     * Логгировать критическую ошибку
     * @param {string} msg error message
     * @param {object} params Параметры
     * @param {boolean} params.console Если false, не сообщение не будет выведено в консоль
     * @param {string[]} params.files Список дополнительных файлов
     * @public
     */

    async error(msg, params = {
        console: true,
        files: []
    }) {
        const level = 'error'
        return this.log(level, msg, params)
    }

    /**
     * Логгировать
     * @param {string} msg error message
     * @param {object} params Параметры
     * @param {boolean} params.console Если false, не сообщение не будет выведено в консоль
     * @param {string[]} params.files Список дополнительных файлов
     * @param {string} level level of message
     * @public
     */
    async log(level, msg, params = {
        console: true
    }) {
        return new Promise((resolve, reject) => {
            try {
                const transports = [
                    this.all_log_transport(level),
                    this.module_log_transport(level)
                ]
                //отключение логгирования в консоль
                if (this.logToConsole || params.console)
                    transports.push(this.log_console(level))
                if (Array.isArray(params.files))
                    for (const logfile of params.files) {
                        transports.push(this.customTransportFile(logfile))
                    }
                else this.warn("Wrong type of params.files")
                for (const transport of transports) {
                    this.logger.add(transport)
                }
                if (typeof msg === 'object')
                    msg = JSON.stringify(msg)
                this.logger.format = this.custom_format(level)
                this.logger.log(level, msg)
                this.logger.clear()
                resolve()
            } catch (error) {
                reject(error)
            }

        })
    }
}

export default Logger