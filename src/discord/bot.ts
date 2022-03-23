import { Client, Intents, Message, MessageEmbed, Permissions } from 'discord.js'
import CommandsLoader from './classes/commandsLoader'
import { CommandError } from './classes/CommandErrors'

export default class Bot {
    private client: Client
    private commands: CommandsLoader

    constructor() {
        this.client = new Client({
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
            intents: new Intents([
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
                Intents.FLAGS.GUILDS,
            ]),
        })
    }

    /**
     * Выполняет логин клиента, устанавливает имя бота
     * @param token
     * @param commands
     * @param username
     */
    public async init(token: string, commands?: CommandsLoader, username?: string): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.client.login(token).catch(e => {
                reject(e)
            })

            this.client.once('ready', async () => {
                resolve()
            })
        }).catch(console.error)

        if (username) await this.client.user.setUsername(username)
        this.setEvents()
        this.commands = commands
    }

    public createInvite(): string {
        return this.client.generateInvite({
            permissions: [Permissions.FLAGS.ADMINISTRATOR],
            scopes: ['bot', 'applications.commands', 'identify', 'guilds'],
        })
    }

    private setEvents() {
        this.client.on('messageCreate', message => this.onMessageCreate(message))
    }

    private async helpCommand(message: Message): Promise<void> {
        const embed = new MessageEmbed().setColor('#2fdeff')
        this.commands.getAllCommands().map(_command => {
            if (_command.showHelp === false) return
            embed.addField(
                _command.syntax ? _command.syntax : '!' + _command.name,
                _command.description || '\u200b'
            )
        })
        await message.reply({ embeds: [embed] })
    }

    private async onMessageCreate(message: Message) {
        if (message.author.bot) return
        if (!message.content.startsWith('!')) return
        const commandName = message.content.slice(1).split(' ')[0].toLowerCase()
        if (['help', 'хелп'].includes(commandName)) {
            await this.helpCommand(message)
            return
        }
        const command = await this.commands.get(commandName)
        if (!command) return
        try {
            await command.execute(message)
        } catch (e) {
            if (e instanceof CommandError) {
                if (e.replyText) {
                    await message.reply(e.replyText).then(errorMessage => {
                        if (e.deleteTimeout)
                            setTimeout(() => {
                                errorMessage.delete()
                            }, e.deleteTimeout)
                    })
                }
            } else {
                await message.reply('Ошибка')
                throw e
            }
        }
    }
}
