import { GuildMember, Message, TextChannel } from 'discord.js'
import { CommandError, TimeoutError } from './CommandErrors'

type questionOptions = {
    timeout?: number,
    validator?: (answer: Message) => boolean
}

export default class Interview {
    public readonly channel: TextChannel
    public readonly respondent: GuildMember
    public readonly canselWord: string
    private messagesToDelete: Array<Message>

    /**
     *
     * @param channel Канал, в котором задаются вопросы
     * @param respondent Участник, отвечающий на вопросы
     * @param canselWord Слово для отмены
     */
    constructor(channel: TextChannel, respondent: GuildMember, canselWord = '!отмена') {
        this.channel = channel
        this.respondent = respondent
        this.canselWord = canselWord
        this.messagesToDelete = new Array<Message>()
    }

    public async ask(question: string, options: questionOptions = { timeout: 200000 }): Promise<Message> {
        const qMessage = await this.channel.send(`<@${this.respondent.id}>, ${question}`)
        const filter = message => message.member.id === this.respondent.id
        let answer: Message
        try {
            answer = await this.channel.awaitMessages({filter, time: options.timeout || 200000, max: 1, errors: ['time']})
                .then(collected => collected.first())
            this.messagesToDelete.push(answer)
        }
        catch (e) {
            if (e.message === 'time')
                throw new TimeoutError(`<@${this.respondent.id}>, время на ответ вышло, попробуйте ещё раз.`)
            throw e
        }
        finally {
            this.messagesToDelete.push(qMessage)
        }
        if(options.validator)
            if(!options.validator(answer)) throw new CommandError('Invalid answer', 'Некорректный ответ')
        if (answer.content.includes(this.canselWord)) {
            await answer.react('❌')
            throw new CommandError('Aborted')
        }
        return answer
    }
    
    public cleanMessages(timeout = 0): void {
        setTimeout(() => {
            this.messagesToDelete.forEach(async message => { await message.delete() })
        }, timeout)
    }
}
