import ICommand from '../classes/ICommand'
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js'
import ApplicationModel from '../../models/ApplicationModel'
import Interview from '../classes/Interview'
import { MemberModel } from '../../models/MemberModel'
import { CommandError } from '../../classes/CommandErrors'

const createApplication = async (message: Message) => {
    const applicationData = await ApplicationModel.findOneByMemberID(message.member.id)
    const interview = new Interview(message.channel as TextChannel, message.member)
    if (applicationData !== null) {
        const answer = (
            await interview.ask('У вас уже есть заявка. Вы хотите заполнить её заново? (да/нет)', {
                validator: answer => ['да', 'нет'].includes(answer.content.toLowerCase()),
            })
        ).content.toLowerCase()
        if (answer === 'нет') return
    }

    const level = await interview.ask('Какой у вас уровень в игре?')
    const micro = await interview.ask('Есть ли у вас микрофон?')
    const link = await interview.ask('Укажите ссылку на ваш профиль в Steam')

    let memberData = await MemberModel.getMemberByID(message.guild.id, message.member.id)
    if (!memberData)
        memberData = new MemberModel({ id: message.member.id, guild_id: message.guild.id })

    memberData.level = level.content
    memberData.micro = micro.content
    memberData.link = link.content

    await memberData.save()
    await message.reply('Ваша заявка сохранена!')
}

const editLevel = async (message: Message) => {
    const memberData = await MemberModel.getMemberByID(message.guild.id, message.member.id)
    if (!memberData)
        throw new CommandError(
            'Member application not found',
            'У вас ещё нет заявки, вы можете заполнить её при помощи команды **!заявка создать**'
        )
    if (!memberData.link || !memberData.level || !memberData.micro)
        throw new CommandError(
            'Member application not found',
            'У вас ещё нет заявки, вы можете заполнить её при помощи команды **!заявка создать**'
        )
    const interview = new Interview(message.channel as TextChannel, message.member)

    const newLevel = await interview.ask('Какой у вас уровень?')
    memberData.level = newLevel.content
    await memberData.save()
    await message.reply('Готово!')
}

const command: ICommand = {
    name: 'заявка',
    description: 'Показать заявку участника',

    async execute(message: Message) {
        const args = message.content.split(' ')

        // Заполнить заявку
        if (args[1] == 'создать') {
            await createApplication(message)
        } else if (args[1] == 'уровень') {
            await editLevel(message)
        }
        // Показать заявку участника
        else {
            let member: GuildMember
            if (message.mentions.members.size === 0) member = message.member
            else if (message.mentions.members.size === 1) member = message.mentions.members.first()
            else throw new Error('Invalid command')

            let memberData = await MemberModel.getMemberByID(message.guild.id, member.id)
            if (!memberData)
                memberData = new MemberModel({ id: member.id, guild_id: message.guild.id })
            if (!memberData.link || !memberData.level || !memberData.micro)
                if (member.id == message.member.id)
                    throw new CommandError(
                        'Member application not found',
                        'У вас ещё нет заявки, вы можете заполнить её при помощи команды **!заявка создать**'
                    )
                else
                    throw new CommandError(
                        'Member application not found',
                        `У участника <@${member.id}> нет заявки.`
                    )

            const embed = new MessageEmbed()
                .setTitle(`Заявка участника ${message.member.displayName}`)
                .addField(':link: Ссылка на steam:', memberData.link)
                .addField(':video_game: Уровень в игре:', memberData.level)
                .addField(':microphone2: Наличие микрофона:', memberData.micro)
                .setFooter({ text: 'Если вы хотите изменить уровень, напишите !заявка уровень' })
                .setThumbnail('https://i.ibb.co/1Q7pQ94/podacha.png')
                .setColor('#37bbe0')
            await message.reply({ embeds: [embed] })
        }
    },
}

export default command
