import { GuildModel } from '../../models/GuildModel'
import {
    ButtonInteraction,
    GuildMember,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from 'discord.js'
import * as randomColor from 'randomcolor'
import * as moment from 'moment'
import Bot from '../Bot'
import { EventModel } from '../../models/EventModel'
import { MemberModel } from '../../models/MemberModel'
import { NotFoundError } from '../../classes/CommandErrors'
import Logger from '../../classes/Logger'

type EventOptions = {
    name: string
    description: string
    datetimeMs: number
    imageUrl: string
}

type EventEditOptions = {
    name?: string
    description?: string
    datetimeMs?: number
    imageUrl?: string
}

export default class GameEventsManager {
    public async createEvent(guildID: string, options: EventOptions): Promise<void> {
        const guildData = await GuildModel.getByGuildID(guildID)
        if (!guildData) throw new Error('Guild not found')

        const discordGuild = await Bot.getInstance().getGuild(guildID)
        await discordGuild.channels.fetch(guildData.channels.tournament_channel)
        if (!discordGuild) throw new Error('Discord guild data unavailable')

        // Канал с турнирами
        const eventsChannel = (await discordGuild.channels.fetch(
            guildData.channels.tournament_channel
        )) as TextChannel
        if (!eventsChannel) throw new Error('Discord channel data unavailable')

        const datetime = moment(options.datetimeMs)

        // Сообщение с турниром
        const eventMessage = new MessageEmbed()
            .setColor(randomColor({ hue: 'green', luminosity: 'light' }))
            .setTitle(`:fire: ${options.name} :fire:`)
            .setDescription(options.description)
            .addField(
                '\u200b',
                `:clock1: Турнир пройдёт **${datetime
                    .locale('ru')
                    .format('ll')}** в **${datetime.format('HH:mm')}** по мск :clock1:`
            )
            .addField('Уже участвуют:', 'Участников пока нет...')
            .setImage(options.imageUrl)

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('add-remove-member')
                .setLabel('ПРИНЯТЬ УЧАСТНИЕ')
                .setStyle('SUCCESS')
        )

        const sentMessage = await eventsChannel.send({ embeds: [eventMessage], components: [row] })

        const newEvent = new EventModel({
            guild_id: guildID,
            name: options.name,
            description: options.description,
            datetimeMs: moment(options.datetimeMs).valueOf(),
            imageUrl: options.imageUrl,
            message_id: sentMessage.id,
        })
        await newEvent.save()

        const scheduledEvent = await discordGuild.scheduledEvents.create({
            name: options.name,
            privacyLevel: 'GUILD_ONLY',
            description: options.description,
            channel: eventsChannel.id,
            scheduledStartTime: moment(options.datetimeMs).toISOString(),
            scheduledEndTime: moment(options.datetimeMs + 1000 * 60 * 60 * 3).toISOString(),
            entityType: 'EXTERNAL',
            entityMetadata: { location: sentMessage.url },
        })
        
        // Уведомление о турнире
        if (guildData.channels.notifications_channel) {
            const notificationsChannel = (await discordGuild.channels.fetch(
                guildData.channels.notifications_channel
            )) as TextChannel

            try {
                await notificationsChannel.send(scheduledEvent.url)
            } catch (e) {
                Logger.error(e)
                throw new Error('Cannot send notification message')
            }
        }
    }

    public async editEvent(
        guildID: string,
        messageID: string,
        options?: EventEditOptions
    ): Promise<void> {
        const event = await EventModel.getEventByMessageID(messageID)
        if (!event) throw new NotFoundError(NotFoundError.types.EVENT)
        if (options) {
            event.name = options.name || event.name
            event.description = options.description || event.description
            event.datetimeMs = options.datetimeMs || event.datetimeMs
            event.imageUrl = options.imageUrl || event.imageUrl
            await event.save()
        }

        const guildDB = await GuildModel.getByGuildID(guildID)
        if (!guildDB) throw new NotFoundError(NotFoundError.types.GUILD)
        const eventMembers = await Promise.all(
            event.members.map(async _id => {
                const memberDB = await MemberModel.findById(_id)
                return `<@${memberDB.id}>`
            })
        )

        const discordGuild = await Bot.getInstance().getGuild(guildID)
        const discordChannel = (await discordGuild.channels.fetch(
            guildDB.channels.tournament_channel
        )) as TextChannel
        const discordMessage = await discordChannel.messages.fetch(messageID)

        const datetime = moment(event.datetimeMs)
        const embedEvent = new MessageEmbed()
            .setTitle(event.name)
            .setDescription(event.description)
            .addField(
                '\u200b',
                `:clock1: Турнир пройдёт **${datetime
                    .locale('ru')
                    .format('ll')}** в **${datetime.format('HH:mm')}** по мск :clock1:`
            )
            .addField(
                '\u200b',
                ':game_die: **УЖЕ УЧАСТВУЮТ:** ' +
                    (eventMembers.length > 0 ? eventMembers.join(', ') : 'Участников пока нет...')
            )
            .setImage(event.imageUrl)
            .setColor(discordMessage.embeds[0].color)

        await discordMessage.edit({ embeds: [embedEvent] })
    }

    public async onEventButtonClick(interaction: ButtonInteraction): Promise<void> {
        if (interaction.customId == 'add-remove-member') {
            const event = await EventModel.getEventByMessageID(interaction.message.id)

            if (!event) {
                await interaction.reply({
                    content:
                        ':skull_crossbones: Что-то пошло не так... Возможно заявки на этот турнир уже не принимаются.',
                    ephemeral: true,
                })
                return
            }

            let member = await MemberModel.getMemberByID(
                interaction.guild.id,
                (interaction.member as GuildMember).id
            )

            if (!member) {
                member = new MemberModel({
                    id: (interaction.member as GuildMember).id,
                    guild_id: interaction.guild.id,
                })
                await member.save()
            }

            if (!event.members.includes(member._id)) {
                await event.updateOne({ $push: { members: member._id } })
                await interaction.reply({ content: 'Вы участвуете!', ephemeral: true })
            } else {
                await event.updateOne({ $pull: { members: member._id } })
                await interaction.reply({
                    content: 'Вы отменили своё участие :frowning2:',
                    ephemeral: true,
                })
            }

            await this.editEvent(interaction.guild.id, interaction.message.id)

            if (!member.link)
                await interaction.reply({
                    content:
                        'Не забудь указать ссылку на steam. Для этого напиши !ссылка [твоя ссылка].',
                })
        }
    }
}
