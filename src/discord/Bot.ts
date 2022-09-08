import {
    ButtonInteraction,
    Client,
    Collection,
    Guild,
    GuildMember,
    Intents,
    MessageReaction,
    Permissions,
    User,
} from 'discord.js'
import CommandsManager from './classes/CommandsManager'
import logger from '../classes/Logger'
import GameEventsManager from './classes/GameEventsManager'
import { MemberModel } from '../models/MemberModel'
import { ClanModel } from '../models/ClanModel'
import ReportsManager from './classes/ReportsManager'
import Logger from '../classes/Logger'
import PointsManager from './classes/PointsManager'

export default class Bot {
    private static instance
    private client: Client
    private commandsManager: CommandsManager
    private eventsManager: GameEventsManager
    private reportsManager: ReportsManager
    private pointsManager: PointsManager

    private constructor() {
        this.client = new Client({
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
            intents: new Intents([
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ]),
        })
    }

    public static getInstance(): Bot {
        if (!Bot.instance) Bot.instance = new Bot()
        return Bot.instance
    }

    /**
     * Выполняет логин клиента, устанавливает имя бота
     * @param token
     * @param commandsManager
     * @param username
     */
    public async init(
        token: string,
        commandsManager?: CommandsManager,
        username?: string
    ): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.client.login(token).catch(e => {
                reject(e)
            })

            this.client.once('ready', async () => {
                resolve()
            })
        }).catch(console.error)
        logger.info('Discord client ready')

        if (username) await this.client.user.setUsername(username)
        this.commandsManager = commandsManager
        this.eventsManager = new GameEventsManager()
        this.reportsManager = new ReportsManager()
        this.setEvents()
    }

    private setEvents() {
        this.client.on('messageCreate', message => this.commandsManager.handleMessage(message))
        this.client.on('interactionCreate', async interaction => {
            if (interaction instanceof ButtonInteraction)
                try {
                    await this.eventsManager.onEventButtonClick(interaction)
                } catch (e) {
                    Logger.error(e)
                }
        })
        this.client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.emoji.name != '✅') return
            if (reaction.partial) reaction = await reaction.fetch()
            if (user.partial) user = await user.fetch()
            try {
                await this.reportsManager.onReactionAdd(reaction as MessageReaction, user as User)
            } catch (e) {
                Logger.error(e)
            }
        })
    }

    public async getGuildById(id: string): Promise<Guild> {
        return this.client.guilds.fetch(id)
    }

    public createInvite(): string {
        return this.client.generateInvite({
            permissions: [Permissions.FLAGS.ADMINISTRATOR],
            scopes: ['bot', 'applications.commands', 'identify', 'guilds'],
        })
    }

    public async getAllGuilds(): Promise<Guild[]> {
        await this.client.guilds.fetch()
        return this.client.guilds.cache.map(guild => guild)
    }

    public async getGuild(id: string): Promise<Guild> {
        try {
            await this.client.guilds.fetch(id)
            return this.client.guilds.cache.find(guild => guild.id == id)
        } catch (e) {
            return undefined
        }
    }

    public async getMemberByID(guildID: string, id: string): Promise<GuildMember> {
        let member: GuildMember
        try {
            const guild = await this.client.guilds.fetch(guildID)
            member = await guild.members.fetch(id)
        } catch (e) {
            member = undefined
        }
        return member
    }

    public async getUserByID(id: string): Promise<User> {
        let user: User
        try {
            user = await this.client.users.fetch(id)
        } catch (e) {
            user = undefined
        }
        return user
    }

    public async getMembersByIDs(
        guildID: string,
        IDs: string[]
    ): Promise<Collection<string, GuildMember>> {
        let members: Collection<string, GuildMember>
        try {
            const guild = await this.client.guilds.fetch(guildID)
            members = await guild.members.fetch({ user: IDs })
        } catch (e) {
            members = undefined
        }
        return members
    }

    public getEventsManager(): GameEventsManager {
        return this.eventsManager
    }
    
    public getPointsManager(): PointsManager {
        return this.pointsManager
    }

    public async getMemberPermissions(guildID: string, memberID: string): Promise<string[]> {
        const member = await MemberModel.getMemberByID(guildID, memberID)
        if (!member) return []
        if (!member.permissions) return []
        return member.permissions
    }

    public async getMemberClanRoleID(guildID: string, memberID: string): Promise<string> {
        const discordMemberData = await Bot.getInstance().getMemberByID(guildID, memberID)
        if (!discordMemberData) throw new Error('Discord member data unavailable')
        const clansData = await ClanModel.getAllGuildClans(guildID)
        const clanRoles = clansData.map(c => c.role_id)
        const memberRoles = discordMemberData.roles.cache.map(role => role.id)
        const memberClanRoles = memberRoles.filter(id => clanRoles.includes(id))
        if (!memberClanRoles) return undefined
        return memberClanRoles[0]
    }

    public numberToEmojis(num: number): string {
        const digitStrings = {
            0: 'zero',
            1: 'one',
            2: 'two',
            3: 'three',
            4: 'four',
            5: 'five',
            6: 'six',
            7: 'seven',
            8: 'eight',
            9: 'nine',
            '-': 'heavy_minus_sign',
        }

        return num
            .toString()
            .split('')
            .map(digit => `:${digitStrings[digit]}:`)
            .join(' ')
    }
}
