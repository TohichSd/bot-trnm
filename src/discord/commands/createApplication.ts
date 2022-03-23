import ICommand from '../classes/ICommand'
import { Message, TextChannel } from 'discord.js'
import ApplicationModel from '../../db/ApplicationModel'
import Interview from '../classes/Interview'

const command: ICommand = {
    name: 'создать-заявку',
    description: 'Создать заявку для участия в турнирах',

    async execute(message: Message) {
        const applicationData = await ApplicationModel.findOneByMemberID(message.member.id)
        const interview = new Interview(message.channel as TextChannel, message.member)
        if (applicationData !== null) {
            const answer = (
                await interview.ask(
                    'У вас уже есть заявка. Вы хотите заполнить её заново? (да/нет)',
                    {
                        validator: answer => ['да', 'нет'].includes(answer.content.toLowerCase()),
                    }
                )
            ).content.toLowerCase()
            if (answer === 'нет') return
        }
        
        const level = interview.ask('Какой у вас уровень в игре?')
        const micro = interview.ask('Есть ли у вас микрофон?')
        const link = interview.ask('Укажите ссылку на ваш профиль в Steam')

        const application = new ApplicationModel({
            guild_id: message.guild.id,
            id: message.member.id,
            level,
            link,
            micro,
        })
        await application.save()

        await message.reply('Ваша заявка сохранена!')
    },
}

export default command
