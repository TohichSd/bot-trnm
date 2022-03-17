import { Message } from 'discord.js'

export default interface ICommand {
    name: string,
    // другие имена по которым можно вызвать команду
    aliases?: string[],
    description?: string,
    syntax?: string,
    // Выводить ли при вызове команды !help
    showHelp?: boolean,
    
    execute(message: Message): Promise<void>
}
