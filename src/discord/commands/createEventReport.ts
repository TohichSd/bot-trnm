import ICommand from '../classes/ICommand'
import { Config } from '../../config/BotConfig'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import * as randomColor from 'randomcolor'
import Interview from '../classes/Interview'
import { CommandError } from '../../classes/CommandErrors'
import { EventReportModel } from '../../models/EventReportModel'
import { EventModel } from '../../models/EventModel'
import { GuildModel } from '../../models/GuildModel'
import Logger from '../../classes/Logger'
import Permissions = Config.Permissions

const command: ICommand = {
    name: 'отчёт',
    aliases: ['отчет'],
    description: 'Создать отчёт о турнире',
    permissions: [Permissions.MANAGE_EVENTS],

    async execute(message: Message) {
        const interview = new Interview(message.channel as TextChannel, message.member)

        const guildData = await GuildModel.getByGuildID(message.guild.id)
        const events = await EventModel.getNewGuildEvents(message.guild.id)

        let event
        if (events.length === 1) {
            event = events[0]
        } else if (events.length > 1) {
            const validator = answer => {
                const num = parseInt(answer.content)
                if (!num) return false
                return num >= 1 && num <= events.length
            }
            const chooseEventString = events.map((event, i) => `${i + 1}) ${event.name}`).join('\n')
            const eventNumAnswer = await interview.ask(
                `Выберите турнир (1-${events.length}):\n${chooseEventString}`,
                { validator }
            )
            const num = parseInt(eventNumAnswer.content)
            event = events[num - 1]
        } else {
            throw new CommandError(
                'No new events found',
                'Турниры не обнаружены :frowning2:',
                10000
            )
        }

        // Участники турнира
        const members = (
            await interview.ask(
                'Перечислите участников игры **кроме себя**, *@упомянув* их в одном сообщении',
                { validator: message => message.mentions.members.size == 3 }
            )
        ).mentions.members.map(m => m.id)

        // Победитель
        const winner = (
            await interview.ask('Кто победил? Ответьте, *@упомянув* участника', {
                validator: message => message.mentions.members.size == 1,
            })
        ).mentions.members.first().id

        if (members[0] != winner) {
            members.splice(members.indexOf(winner, 1))
            members.splice(0, 0, winner)
        }

        if (winner != message.member.id) members.push(message.member.id)

        const numberValidator = m => !isNaN(parseInt(m.content))
        
        const points0 = parseInt((await interview.ask(`Сколько очков получает <@${members[0]}>?`, {
            validator: numberValidator,
        })).content)
        const points1 = parseInt((await interview.ask(`Сколько очков получает <@${members[1]}>?`, {
            validator: numberValidator,
        })).content)
        const points2 = parseInt((await interview.ask(`Сколько очков получает <@${members[2]}>?`, {
            validator: numberValidator,
        })).content)
        const points3 = parseInt((await interview.ask(`Сколько очков получает <@${members[3]}>?`, {
            validator: numberValidator,
        })).content)
        
        const points = [points0, points1, points2, points3]

        // Скрин
        const imageAnswer = await interview.ask('Отправьте скрин', {
            validator: message => message.attachments.size == 1,
        })

        let members_string = `:first_place:<@${winner}> - ${points[0]}:cyclone:`
        await Promise.all(
            members.map((id, i) => {
                if (id !== winner) members_string += `\n:game_die:<@${id}> - ${points[i]}:cyclone:`
            })
        )

        const eventReport = new EventReportModel()
        eventReport.guild_id = message.guild.id
        eventReport.winner = winner
        eventReport.members = members
        eventReport.points = points
        eventReport.moderator = message.member.id
        eventReport.event = event._id

        const embedReport = new MessageEmbed()
            .setAuthor({ name: 'Отчёт о турнире' })
            .setTitle(event.name)
            .setURL(
                `https://discord.com/channels/${message.guild.id}/${guildData.channels.tournament_channel}/${event.message_id}`
            )
            .addField('Участники:', members_string)
            .addField('\u200b', `:purple_circle: Проводил ${message.member.toString()}`)
            .setColor(randomColor({ luminosity: 'light' }))

        try {
            const imageStoreChannel = (await message.guild.channels.fetch(
                guildData.channels.game_report_images_channel
            )) as TextChannel

            await imageStoreChannel
                .send({ files: [imageAnswer.attachments.first().url] })
                .then(m => {
                    embedReport.setImage(m.attachments.first().url)
                })
        } catch (e) {
            Logger.error(e)
            throw new CommandError(
                'Error while sending image',
                '(4) Попробуйте ещё раз или обратитесь к администрации сервера.'
            )
        }

        try {
            const sentMessage = await message.channel.send({ embeds: [embedReport] })
            eventReport.message_id = sentMessage.id
        } catch (e) {
            Logger.warn(e)
            throw new CommandError(
                'Cannot find report message',
                'Ошибка. Используйте эту команду в **том же канале**' +
                    'где вы использовали команду *создать-комнату*'
            )
        }
        await eventReport.save()
    },
}

export default command
