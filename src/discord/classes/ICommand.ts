import { Interaction, Message } from 'discord.js'
import { Config } from '../../config/BotConfig'

export default interface ICommand {
    name: string
    // другие имена по которым можно вызвать команду
    aliases?: string[]
    description?: string
    syntax?: string
    // Выводить ли при вызове команды !help
    showHelp?: boolean
    disabled?: boolean
    // Каналы, в которых команда разрешена
    allowedChannels?: string[]
    permissions?: [Config.Permissions]

    execute(message: Message | Interaction): Promise<void>
}
