import { Client, Intents, Permissions } from 'discord.js'
import CommandsLoader from './classes/commandsLoader'

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

    public async init(token: string, username: string = undefined): Promise<void> {
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
        this.commands = new CommandsLoader()
        await this.commands.load(__dirname + '/commands').catch(err => {
            throw err
        })
    }

    public createInvite(): string {
        return this.client.generateInvite({
            permissions: [Permissions.FLAGS.ADMINISTRATOR],
            scopes: ['bot', 'applications.commands', 'identify', 'guilds'],
        })
    }

    private setEvents() {
        this.client.on('messageCreate', async message => {
            if (message.author.bot) return
            if (!message.content.startsWith('!')) return
            const commandName = message.content.slice(1).split(' ')[0].toLowerCase()
            const command = await this.commands.get(commandName)
            if(!command) return
            try {
                await command.execute(message)
            }
            catch (e) {
                await message.reply('Ошибка')
            }
        })
    }

    /*private async registerSlashCommands() {
        const rest = new REST({ version: '9' }).setToken(this.client.token)
        const slashCommands = this.commands.getJson()
        try {
            await this.client.guilds.fetch()
            await Promise.all(
                this.client.guilds.cache.map(async guild => {
                    // @ts-ignore
                    await rest.put(Routes.applicationGuildCommands(env.D_CLIENT_ID, guild.id), {
                        body: slashCommands,
                    })
                })
            )
        } catch (err) {
            console.error(err)
        }
    }*/
}
