import { createWriteStream, WriteStream } from 'fs'
import * as moment from 'moment'
import { CommandError } from './CommandErrors'
import { join } from 'path'

enum levels {
    INFO,
    WARN,
    ERROR,
}

class Logger {
    private static instance: Logger
    private readonly logStream: WriteStream
    private readonly errorStream: WriteStream

    private constructor(path) {
        this.logStream = createWriteStream(join(path, 'logs.log'), { flags: 'w' })
        this.errorStream = createWriteStream(join(path, 'errors.log'), { flags: 'w' })
    }

    public static getInstance(path = '.'): Logger {
        if (!Logger.instance) Logger.instance = new Logger(path)
        return Logger.instance
    }

    private logCommonInfo(level: levels) {
        if (level === levels.INFO)
            this.logStream.write(`INFO\n[${moment().format('DD/MM/YYYY, HH:mm:ss')}]\n`)
        if (level === levels.WARN)
            this.logStream.write(`WARN\n[${moment().format('DD/MM/YYYY, HH:mm:ss')}]\n`)
        if (level === levels.ERROR) {
            this.logStream.write(`ERROR\n[${moment().format('DD/MM/YYYY, HH:mm:ss')}]\n`)
            this.errorStream.write(`ERROR\n[${moment().format('DD/MM/YYYY, HH:mm:ss')}]\n`)
        }
    }

    public info(message: string): void {
        this.logCommonInfo(levels.INFO)
        this.logStream.write(message + '\n')
        this.logStream.write('\n')
    }

    public warn(e: Error): void
    public warn(e: string): void

    public warn(warning): void {
        let log: string
        this.logCommonInfo(levels.WARN)
        // Если передана ошибка:
        if (warning instanceof Error || warning instanceof CommandError) {
            log = warning.stack + '\n'
            if (warning instanceof CommandError) log += `Reply: ${warning.replyText}\n`
            console.error(warning)
        } 
        // Если передана строка
        else if (typeof warning == 'string') {
            log = warning + '\n'
            console.log(warning)
        }
        log += '\n'
        this.logStream.write(log)
    }

    public error(error: Error): void {
        this.logCommonInfo(levels.ERROR)
        const log = error.stack + '\n'
        this.logStream.write(log)
        this.errorStream.write(log)
        console.error(error)
    }

    public close(): void {
        this.logStream.close()
        this.errorStream.close()
    }
}

export default Logger.getInstance()
