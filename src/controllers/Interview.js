class Interview {
  /**
   * @param {object} questions Вопросы в формате ключ:вопрос
   * @param {TextChannel | DMChannel | NewsChannel} channel канал, куда отправить интервью
   * @param {Object} options Дополнительные параметры
   * @param {string} memberID ID участника, отвечающего на вопросы
   * @param {string} startPhrase Фраза при начале интервью
   * @param {string} options.stop Слово для остновки интервью
   * @param {number} options.timeout Максимальное время ожидания
   */
  constructor(
    questions,
    channel,
    memberID,
    startPhrase,
    options = {stop: '!отмена', timeout: 300000, deleteQuestions: false}
  ) {
    this.questions = questions
    this.channel = channel
    this.options = options
    this.memberID = memberID
    this.startPhrase = startPhrase
    this.messagesToDelete = []
  }

  async question(keys, answers = []) {
    const key = await keys.shift()
    const q_message = await this.channel.send(this.questions[key])
    this.messagesToDelete.push(q_message)
    await this.channel
      .awaitMessages(m => m.author.id === this.memberID, {
        max: 1,
        time: this.options.timeout,
        errors: ['time'],
      })
      .then(async collected => {
        answers[key] = collected.first()
        if (collected.first().content.toLowerCase().includes(this.options.stop))
          throw new Error('Stop')
        if (this.options.deleteQuestions) {
          this.messagesToDelete.push(collected.first())
        }
      })
      .catch(err => {
        throw err
      })
    if (keys.length > 0) return this.question(keys, answers)
    if (this.options.deleteQuestions)
      this.messagesToDelete.forEach(m => m.delete())
    return answers
  }

  /**
   * @return {Promise<Object>}
   */
  async start() {
    return this.question(Object.keys(this.questions))
  }
}

export default Interview
