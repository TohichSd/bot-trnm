import ICommand from '../classes/ICommand'
import { Config } from '../../config/BotConfig'
import Permissions = Config.Permissions
import { Message, TextChannel } from 'discord.js'
import Interview from '../classes/Interview'
import { GuildModel } from '../../models/GuildModel'
import { Event, EventModel } from '../../models/EventModel'
import { CommandError } from '../../classes/CommandErrors'
import { DocumentType } from '@typegoose/typegoose'

const command: ICommand = {
    name: 'завершить-турнир',
    description: 'Турнир будет завершён, заявки и отчёты больше не будут приниматься',
    permissions: [Permissions.MANAGE_EVENTS],

    async execute(message: Message) {
        const interview = new Interview(message.channel as TextChannel, message.member)

        const events = await EventModel.getNewGuildEvents(message.guild.id)

        let event: DocumentType<Event>
        if (events.length === 1) {
            event = events[0] as DocumentType<Event>
            const yn = await interview.ask(
                `Вы хотите завершить турнир **${event.name}**? (да/нет)`,
                {
                    validator: m =>
                        m.content.toLowerCase() == 'да' || m.content.toLowerCase() == 'нет',
                }
            )
            if (yn.content == 'нет') {
                interview.cleanMessages()
                await message.delete()
                return
            }
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
            throw new CommandError('No new events found', 'Турниры не обнаружены :frowning2:')
        }

        event.isOver = true
        await event.save()

        await message.reply('Готово!')
    },
}

export default command
