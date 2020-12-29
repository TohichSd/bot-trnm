/**
 * @module interview
 */

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
            if (this.params.start != undefined && this.params.start != null) this.channel.send(this.params.start).then(message => messagesToDelete.push(message));
            (async () => {
                for (const key of Object.keys(this.questions)) {
                    await this.channel.send(this.questions[key])
                        .then(async (message) => {
                            messagesToDelete.push(message)
                            await this.channel.awaitMessages(this.filter, this.params.awaitMessagesOptions)
                                .then(collected => {
                                    console.log(collected.first().content)
                                    if (collected.first().content.includes(this.params.stop))
                                        isStopped = true
                                    result[key] = collected.first()
                                    messagesToDelete.push(collected.first())
                                })
                        })
                    if (isStopped) break
                }
                if (!isStopped) {
                    if (this.params.end)
                        this.channel.send(this.params.end).then(message => setTimeout(() => message.delete()), 7000)
                    resolve(result)
                } else {
                    reject("Member stopped interview")
                    this.channel.send(this.params.cancel)
                }
                for (const mtd of messagesToDelete) {
                    mtd.delete()
                }
            })()
        })
    }
}

export default Interview