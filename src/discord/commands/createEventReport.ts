import ICommand from '../classes/ICommand'
import { Config } from '../../config/BotConfig'
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js'
import Interview from '../classes/Interview'
import { CommandError } from '../../classes/CommandErrors'
import { EventReportModel } from '../../models/EventReportModel'
import { EventModel } from '../../models/EventModel'
import { GuildModel } from '../../models/GuildModel'
import Logger from '../../classes/Logger'
import * as randomColor from 'randomcolor'
import { ClanModel } from '../../models/ClanModel'
import { MemberModel } from '../../models/MemberModel'
import Permissions = Config.Permissions

const command: ICommand = {
    name: 'отчёт',
    aliases: ['отчет'],
    description: 'Создать отчёт о турнире',
    permissions: [Permissions.MANAGE_EVENTS],

    async execute(message: Message) {
        const interview = new Interview(message.channel as TextChannel, message.member)

        const answerError = () => {
            message.delete()
            interview.cleanMessages(30000)
            throw new CommandError(
                'Invalid interview answer',
                'Неверное заполнение, попробуйте снова'
            )
        }

        const guildData = await GuildModel.getByGuildID(message.guild.id)

        let imageStoreChannel: TextChannel
        try {
            imageStoreChannel = (await message.guild.channels.fetch(
                guildData.channels.game_report_images_channel
            )) as TextChannel
        } catch (e) {
            Logger.error(e)
            throw new CommandError(
                'Error while fetching data from Discord',
                '(42) Попробуйте ещё раз или обратитесь к администрации сервера.'
            )
        }

        const events = await EventModel.getNewGuildEvents(message.guild.id)

        let event

        if (events.length === 1) {
            event = events[0]
        } else if (events.length > 1) {
            const chooseEventString = events.map((event, i) => `${i + 1}) ${event.name}`).join('\n')
            const eventNumAnswer = await interview.ask(
                `Выберите турнир (1-${events.length}):\n${chooseEventString}`
            )
            const num = parseInt(eventNumAnswer.content)
            if (!num) answerError()
            event = events[num - 1]
        } else
            throw new CommandError(
                'No new events found',
                'Турниры не обнаружены :frowning2:',
                10000
            )

        // Кто проводил турнир
        const eventModeratorAnswer = await interview.ask(
            'Кто проводил турнир? Напишите **!я**, если проводили вы или *@упомяните* участника если его проводил кто-то другой',
            { validator: message => message.content == '!я' || message.mentions.members.size == 1 }
        )
        let moderator: GuildMember
        if (eventModeratorAnswer.content == '!я') moderator = message.member
        else if (eventModeratorAnswer.mentions.members.size == 1)
            moderator = eventModeratorAnswer.mentions.members.first()
        else answerError()

        // Участники турнира
        const members = (
            await interview.ask(
                'Перечислите участников турнира **кроме проводящего**, *@упомянув* их в одном сообщении',
                { validator: message => message.mentions.members.size == 3 }
            )
        ).mentions.members.map(member => member)

        // Победитель
        const winner = (
            await interview.ask('Кто победил? Ответьте, *@упомянув* участника', {
                validator: message => message.mentions.members.size == 1,
            })
        ).mentions.members.first()

        // Скрин
        const imageAnswer = await interview.ask('Отправьте скрин', {
            validator: message => message.attachments.size == 1,
        })

        // Строка с участниками
        let members_string = `:first_place:${winner.toString()}:first_place:`
        members.push(moderator)
        await Promise.all(
            members.map(member => {
                if (member.id != winner.id)
                    members_string += `\n:game_die:${member.toString()}:game_die:`
            })
        )

        const membersIDs = members.map(member => member.id)

        const embedReport = new MessageEmbed()
            .setAuthor('Отчёт о турнире')
            .setTitle(event.name)
            .addField('Участники:', members_string)
            .addField('\u200b', `Проводил ${moderator.toString()}`)
            .setColor(randomColor({ luminosity: 'light' }))
            .setURL(
                `https://discord.com/channels/${message.guild.id}/${guildData.channels.tournament_channel}/${event.message_id}`
            )

        try {
            await imageStoreChannel
                .send({ files: [imageAnswer.attachments.first().url] })
                .then(m => {
                    embedReport.setImage(m.attachments.first().url)
                })
        } catch (e) {
            Logger.error(e)
            throw new CommandError(
                'Error while sending image',
                '(40) Попробуйте ещё раз или обратитесь к администрации сервера.'
            )
        }

        try {
            const messageID = (await message.channel.send({ embeds: [embedReport] })).id
            await message.delete()

            const reportDB = new EventReportModel({
                moderator: message.member.id,
                members: membersIDs,
                winner: winner.id,
                message_id: messageID,
                guild_id: message.guild.id,
            })
            await reportDB.save()

            await event.updateOne({ isOver: true })
        } catch (e) {
            Logger.error(e)
            throw new CommandError(
                'Error while sending report message',
                '(41) Попробуйте ещё раз или обратитесь к администрации сервера.'
            )
        }
        interview.cleanMessages(10000)

        // начисление очков
        const clans = await ClanModel.getAllGuildClans(message.guild.id)
        await Promise.all(
            members.map(async member => {
                const memberRoles = member.roles.cache.map(role => role.id)
                const clan = clans.filter(c => memberRoles.includes(c.role_id))
                const memberData = await MemberModel.getMemberByID(message.guild.id, member.id)
                await memberData.editPoints(
                    memberData.points + member.id == winner.id
                        ? Config.POINTS.E_GAME_WIN
                        : Config.POINTS.E_GAME
                )
                if (clan)
                    await clan[0].updateOne({
                        $set: {
                            points:
                                clan[0].points + member.id == winner.id
                                    ? Config.POINTS.E_GAME_WIN
                                    : Config.POINTS.E_GAME,
                        },
                    })
            })
        )
    },
}

export default command
