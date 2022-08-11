import { getReasonPhrase, StatusCodes } from 'http-status-codes'

/**
 * Ошибка которую нужно кидать внутри команд
 */
export class CommandError extends Error {
    public replyText: string
    public readonly deleteTimeout: number

    constructor(message: string, replyText?: string, deleteTimeout?: number) {
        super(message)
        this.replyText = replyText
        this.deleteTimeout = deleteTimeout
    }
}

export class CommandSyntaxError extends CommandError {
    constructor(syntax?: string) {
        super(
            'Invalid command syntax',
            `**Ошибка: Неверная команда!**\nИспользование: ${syntax || ''}`
        )
    }
}

export class TimeoutError extends CommandError {
    constructor(replyText?: string, deleteTimeout?: number) {
        super('Timeout', replyText, deleteTimeout)
    }
}

enum NotFoundTypes {
    GUILD,
    CHANNEL,
    MEMBER,
    CLAN,
    EVENT,
}

export class NotFoundError extends CommandError {
    public static types = NotFoundTypes

    constructor(notFoundType: NotFoundTypes) {
        super('Record Not Found')
        const replies = {
            [NotFoundTypes.GUILD]: 'Ошибка 2',
            [NotFoundTypes.CHANNEL]: 'Ошибка 3',
            [NotFoundTypes.MEMBER]: 'Ошибка 20',
            [NotFoundTypes.CLAN]: 'Ошибка 30',
            [NotFoundTypes.EVENT]: 'Ошибка: 10',
        }

        this.replyText = '❌**' + replies[notFoundType] + '**❌'
    }
}

export class HTTPError extends Error {
    public readonly code: StatusCodes
    public readonly response: string
    public readonly title: string
    public errorType

    constructor(code: StatusCodes, response?: string, title?: string) {
        super()
        this.errorType = 'HTTPError'
        this.code = code
        this.response = response || getReasonPhrase(code)
        this.title = title
    }
}

export class APIError extends HTTPError {
    constructor(code: StatusCodes, response?: string) {
        super(code, response)
        this.errorType = 'APIError'
    }
}
