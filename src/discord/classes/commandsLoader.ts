import { readdir } from 'fs/promises'
import ICommand from './ICommand'

export default class CommandsLoader {
    private readonly commands: ICommand[]

    private constructor(commands: ICommand[]) {
        this.commands = commands
    }

    static async load(path: string): Promise<CommandsLoader> {
        const files = await readdir(path)
        const commands = await Promise.all(
            files.map(async file => {
                const cmd = await import(`${path}/${file}`)
                if (typeof cmd.default !== 'object')
                    throw new Error('Invalid command file default export type')
                if (cmd.default.disabled) return
                return cmd.default
            })
        )
        return new CommandsLoader(commands)
    }

    get(name: string): ICommand {
        const command = this.commands.find(_command => {
            if (_command.name === name) return true
            else if (_command.aliases) if (_command.aliases.includes(name)) return true
            return false
        })
        if (command) return command
        return undefined
    }

    getAllCommands(): ICommand[] {
        return this.commands
    }
}
