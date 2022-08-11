import { readdir } from 'fs/promises'
import ICommand from './ICommand'
import { Message, MessageEmbed } from 'discord.js'
import { CommandError } from '../../classes/CommandErrors'
import logger from '../../classes/Logger'

export default class CommandsManager {
    private readonly commands: ICommand[]

    private constructor(commands: ICommand[]) {
        this.commands = commands
    }

    /**
     * Загрузить команды ICommand. Возвращает объект CommandManager.
     * @param path путь к директории с командами
     */
    static async load(path: string): Promise<CommandsManager> {
        const files = await readdir(path)
        const commands = await Promise.all(
            files.map(async file => {
                const cmd = await import(`${path}/${file}`)
                if (typeof cmd.default !== 'object')
                    throw new Error('Invalid command file default export type (' + file + ')')
                if (cmd.default.disabled) return
                return cmd.default
            })
        )
        return new CommandsManager(commands)
    }

    public get(name: string): ICommand {
        const command = this.commands.find(_command => {
            if (_command.name === name) return true
            else if (_command.aliases) if (_command.aliases.includes(name)) return true
            return false
        })
        if (command) return command
        return undefined
    }

    public getAllCommands(): ICommand[] {
        return this.commands
    }

    /**
     * Обрабатывает сообщения, если сообщение является командой, вызывает её.
     */
    public async handleMessage(message: Message): Promise<void> {
        const prefix = '!!'
        
        if (message.author.bot) return
        if (!message.content.startsWith(prefix)) return
        const commandName = message.content.slice(prefix.length).split(' ')[0].toLowerCase()
        if (['help', 'хелп'].includes(commandName)) {
            await this.helpCommand(message)
            return
        }
        const command = await this.get(commandName)
        if (!command) return
        try {
            logger.info(`${message.author.tag} used command "${message.content}"`)
            await command.execute(message)
        } catch (e) {
            if (e instanceof CommandError) {
                logger.warn(e)
                await message.reply(e.replyText).then(errorMessage => {
                    if (e.deleteTimeout)
                        setTimeout(() => {
                            errorMessage.delete()
                            message.delete()
                        }, e.deleteTimeout)
                })
            } else {
                logger.error(e)
                await message.reply('(Ошибка 0) Обратитесь к администрации сервера.')
            }
        }
    }

    private async helpCommand(message: Message): Promise<void> {
        const embed = new MessageEmbed().setColor('#2fdeff')
        this.getAllCommands().map(_command => {
            if (_command.showHelp === false) return
            embed.addField(
                _command.syntax ? _command.syntax : '!' + _command.name,
                _command.description || '\u200b'
            )
        })
        await message.reply({ embeds: [embed] })
    }
}
