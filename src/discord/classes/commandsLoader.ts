import { readdir } from 'fs/promises'
import ICommand from './ICommand'

export default class CommandsLoader {
    private commands: ICommand[]

    async load(path: string): Promise<void> {
        const files = await readdir(path)
        this.commands = await Promise.all(
            files.map(async file =>
                import(`${path}/${file}`).then(cmd => cmd.default)
            )
        )
    }

    get(name: string): ICommand {
        const command = this.commands.find(_command => _command.name === name ||_command.aliases.includes(name))
        if (command) return command
        return undefined
    }
    
    getList(): string[] {
        return this.commands.map(_command => _command.name)
    }
}
