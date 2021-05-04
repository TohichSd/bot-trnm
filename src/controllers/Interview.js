class Interview {
  /**
   * @param {object} questions Вопросы
   * @param {ChannelType} channel
   * @param {Object} options Дополнительные параметры
   * @param {string} memberID ID участника
   * @param {string} startPhrase Фраза при начале интервью
   * @param {string} options.stop Слово для остновки интервью
   * @param {number} options.timeout Максимальное время ожидания
   */
  constructor(
    questions,
    channel,
    memberID,
    startPhrase,
    options = { stop: '!отмена', timeout: 300000 }
  ) {
    this.questions = questions
    this.channel = channel
    this.options = options
    this.memberID = memberID
    this.startPhrase = startPhrase
  }

  async question(keys, answers = []) {
    const key = await keys.shift()
    await this.channel.send(this.questions[key])
    await this.channel
      .awaitMessages(m => m.author.id === this.memberID, {
        max: 1,
        time: this.options.timeout,
        errors: ['time'],
      })
      .then(async collected => {
        if (collected.first().content.toLowerCase().includes(this.options.stop))
          throw new Error('Stop')
        answers[key] = collected.first().content
      })
      .catch(err => { throw err})
    if (keys.length > 0) return this.question(keys, answers)
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
