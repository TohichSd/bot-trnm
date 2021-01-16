/**
 * @module interview
 */

import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url), true)

/**
 * Интервью участника в формате вопрос-ответ
 */
class Interview {
    /**
     *
     * @param {object} questions Вопросы
     * @param {object} channel
     * @param {object} filter
     * @param {string} end Фраза после окончания интервью
     * @param {object} params Дополнительные параметры
     * * @param {string} params.cancel Вывод при досрочной остановке
     * @param {string} params.stop слово для отановки интервью
     * @param {string} params.end
     * @param {object} params.awaitMessagesOptions опции для awaitMessages
     */
    constructor(questions, channel, filter, params = {}) {
        /**
         *
         * @param {object} this.questions Вопросы
         */
        this.questions = questions
        /**
         * @param {object} this.channel
         */
        this.channel = channel
        /**
         * @param {object} this.filter
         */
        this.filter = filter
        /**
         * @param {string} this.stop слово для остановки интервью (по умолчанию - отмена)
         */
        this.params = params
        if (!this.params.cancel) params.cancel = "Остановка операции"
        if (!this.params.stop) params.stop = "!отмена"
        this.params.awaitMessagesOptions = {}
        this.params.awaitMessagesOptions.max = 1
<<<<<<< HEAD
        this.params.awaitMessagesOptions.time = 300000
=======
        this.params.awaitMessagesOptions.time = 120000
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
        this.params.awaitMessagesOptions.errors = ['time']
    }

    /**
     * Начинает интервью
     * @returns {Promise<object>} результат
     */
    start() {
        return new Promise((resolve, reject) => {
            let result = {}
            let isStopped = false
            let messagesToDelete = []
            if (this.params.start !== undefined) this.channel.send(this.params.start).then(message => messagesToDelete.push(message));
            (async () => {
                for (const key of Object.keys(this.questions)) {
                    await this.channel.send(this.questions[key])
                        .then(async (message) => {
                            //Добавить сообщение в список для удаления
                            messagesToDelete.push(message)
                            await this.channel.awaitMessages(this.filter, this.params.awaitMessagesOptions)
                                .then(collected => {
                                    console.log(collected.first().content)
                                    //Если сообщение == слову для остановки, выполнит следующее
<<<<<<< HEAD
                                    if (collected.first().content.toLowerCase().includes(this.params.stop))
=======
                                    if (collected.first().content.includes(this.params.stop))
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
                                        //Остановить в конце итерации
                                        isStopped = true
                                    result[key] = collected.first()
                                    messagesToDelete.push(collected.first())
                                })
                                .catch(() => {
                                    this.channel.send("Время на заполнение вышло.")
<<<<<<< HEAD
=======
                                        .then(message => setTimeout(() => {
                                            message.delete()
                                        }, 7000))
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
                                    //Остановить в конце итерации
                                    isStopped = true
                                })
                        })
                    if (isStopped) break
                }
                if (!isStopped) {
                    // if (this.params.end)
                        // this.channel.send(this.params.end).then(message => setTimeout(() => message.delete()), 7000)
                    resolve(result)
                } else {
                    reject("Stopping interview")
<<<<<<< HEAD
                    this.channel.send(this.params.cancel)
                }
=======
                    this.channel.send(this.params.cancel).then(message => setTimeout(() => message.delete(), 7000))
                }
                for (const mtd of messagesToDelete) {
                    // mtd.delete()
                }
>>>>>>> 1601a9aa3517881855a094ab2556a8a86f1d8edc
            })()
        })
    }
}

export default Interview