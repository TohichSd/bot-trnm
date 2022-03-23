/**
 * Ошибка которую нужно кидать внутри комманд
 */
export class CommandError extends Error {
    public readonly replyText: string
    public readonly deleteTimeout: number

    constructor(message: string, replyText?: string, deleteTimeout?: number) {
        super(message)
        this.replyText = replyText
        this.deleteTimeout = deleteTimeout
    }
}

export class CommandSyntaxError extends CommandError {
    constructor(syntax?: string) {
        super('Invalid command syntax', `Неверная команда. ${syntax || ''}`)
    }
}

export class TimeoutError extends CommandError {
    constructor(replyText?: string, deleteTimeout?: number) {
        super('Timeout', replyText, deleteTimeout)
    }
}