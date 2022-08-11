import { CommandError, NotFoundError } from '../../classes/CommandErrors'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import ICommand from '../classes/ICommand'
import Interview from '../classes/Interview'
import { GuildModel } from '../../models/GuildModel'
import * as moment from 'moment'
import * as randomColor from 'randomcolor'
import { GameReportModel } from '../../models/GameReportModel'
import Logger from '../../classes/Logger'

const command: ICommand = {
    name: 'рейтинг',
    description: 'Отчёт о рейтинговой игре',

    async execute(message: Message) {
        // Запрос из БД
        const guildData = await GuildModel.getByGuildID(message.guild.id)
        if (!guildData) throw new NotFoundError(NotFoundError.types.GUILD)

        let imageStoreChannel: TextChannel
        try {
            imageStoreChannel = (await message.guild.channels.fetch(
                guildData.channels.game_report_images_channel
            )) as TextChannel
        } catch (e) {
            Logger.error(e)
            throw new CommandError(
                'Error while fetching data from Discord',
                '(Ошибка 42) Попробуйте ещё раз или обратитесь к администрации сервера.'
            )
        }

        const interview = new Interview(message.channel as TextChannel, message.member)
        const membersAnswer = await interview.ask(
            'Кто участвовал? Напишите ответ, @упомянув всех участников **(кроме себя)** в одном сообщении.'
        )
        const winnerAnswer = await interview.ask('Кто выиграл? Напишите ответ @упомянув участника.')
        const imageAnswer = await interview.ask('Отправьте скрин')

        if (
            membersAnswer.mentions.members.size != 3 ||
            winnerAnswer.mentions.members.size != 1 ||
            imageAnswer.attachments.size != 1 ||
            // Если победитель, указанный участником, не один из игравших
            ![...membersAnswer.mentions.members.map(m => m.id), message.member.id].includes(
                winnerAnswer.mentions.members.first().id
            )
        ) {
            interview.cleanMessages(30000)
            throw new CommandError(
                'Invalid interview answers',
                'Неверное заполнение, попробуйте снова.'
            )
        }

        const game_members = await Promise.all(
            membersAnswer.mentions.members.map(mention => mention.id)
        )
        game_members.push(message.member.id)

        let members_string = `:first_place:<@${
            winnerAnswer.mentions.members.first().id
        }>:first_place:`
        await Promise.all(
            game_members.map(id => {
                if (id !== winnerAnswer.mentions.members.first().id)
                    members_string += `\n:game_die:<@${id}>:game_die:`
            })
        )

        const color = randomColor({
            luminosity: 'light',
        })

        const embedReport = new MessageEmbed()
            .setTitle(
                `**Рейтинговая игра** ${moment().tz('Europe/Moscow').format('DD.MM.YYYY HH:mm')}`
            )
            .addField('Участники:', members_string)
            .addField('\u200b', `Создано участником <@${message.member.id}>`)
            .setFooter('Поздравляем победителя! Очки будут начислены в ближайшее время!')
            .setColor(color)

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
                '(Ошибка 40) Попробуйте ещё раз или обратитесь к администрации сервера.'
            )
        }

        interview.cleanMessages(5000)

        try {
            const messageID = (await message.channel.send({ embeds: [embedReport] })).id
            await message.delete()

            const reportDB = new GameReportModel({
                author: message.member.id,
                members: game_members,
                winner: winnerAnswer.mentions.members.first().id,
                datetimeMs: moment().tz('Europe/Moscow').valueOf(),
                message_id: messageID,
            })
            await reportDB.save()
        } catch (e) {
            Logger.error(e)
            throw new CommandError(
                'Error while sending report message',
                '(Ошибка 41) Попробуйте ещё раз или обратитесь к администрации сервера.'
            )
        }
    },
}

export default command