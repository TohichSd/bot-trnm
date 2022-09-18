import ICommand from '../classes/ICommand'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { Config } from '../../config/BotConfig'
import Interview from '../classes/Interview'
import { GuildModel } from '../../models/GuildModel'
import { CommandSyntaxError, NotFoundError } from '../../classes/CommandErrors'
import { MemberModel } from '../../models/MemberModel'

const assignPermissions = async (message: Message) => {
    const interview = new Interview(message.channel as TextChannel, message.member)
    const memberData = await MemberModel.getMemberByID(
        message.guild.id,
        message.mentions.members.first().id
    )

    const validator = answer =>
        answer.content.toLowerCase() === 'да' || answer.content.toLowerCase() === 'нет'
    const answerConverter = (answer: Message) => answer.content === 'да'

    await message.channel.send('Выберите, какие разрешения будет иметь участник:')
    const admin = answerConverter(
        await interview.ask('Права администратора? (да/нет) - позволяют выполнять все команды', {
            validator,
        })
    )

    const permissions: Config.Permissions[] = []

    if (!admin) {
        const accept_game_reports = answerConverter(
            await interview.ask('Право принимать рейтинговые игры? (да/нет)', {
                validator,
            })
        )
        const access_dashboard = answerConverter(
            await interview.ask('Доступ к панели управления? (да/нет)', {
                validator,
            })
        )
        const manage_events = answerConverter(
            await interview.ask('Управлять турнирами? (да/нет)', {
                validator,
            })
        )
        const manage_clan_wars = answerConverter(
            await interview.ask('Управлять клановыми войнами? (да/нет)', {
                validator,
            })
        )

        if (accept_game_reports) permissions.push(Config.Permissions.ACCEPT_GAME_REPORTS)
        if (access_dashboard) permissions.push(Config.Permissions.ACCESS_DASHBOARD)
        if (manage_events) permissions.push(Config.Permissions.MANAGE_EVENTS)
        if (manage_clan_wars) permissions.push(Config.Permissions.MANAGE_CLAN_WARS)
    }

    if (admin) permissions.push(Config.Permissions.ADMIN)

    await memberData.setPermissions(permissions)
    await message.reply('Готово!')
}

const printMemberRoleInfo = async (message: Message) => {
    const guild = await GuildModel.getByGuildID(message.guild.id)
    if (!guild) throw new NotFoundError(NotFoundError.types.GUILD)
    const memberData = await MemberModel.getMemberByID(
        message.guild.id,
        message.mentions.members.first().id
    )

    let permissions = []

    if (memberData) permissions = memberData.permissions

    const embed = new MessageEmbed()
        .setDescription(`Права для участника <@${message.mentions.members.first().id}>`)
        .setColor('#32c9ae')
        .setFooter({
            text: 'Если вы хотите изменить права участника, напишите !права изменить @участник',
        })
    const translate = {
        admin: 'Админ (все разрешения)',
        accept_game_reports: 'Принимать рейтинговые игры',
        access_dashboard: 'Доступ к панели управления',
        manage_clan_wars: 'Управлять клановыми войнами',
    }

    for (const permission of Object.keys(translate)) {
        embed.addField(translate[permission], permissions.includes(permission) ? 'Да' : 'Нет')
    }
    await message.reply({ embeds: [embed] })
}

const command: ICommand = {
    name: 'права',
    description: 'Посмотреть/изменить права для участника',
    syntax: '!права [изменить] @участник',
    permissions: [Config.Permissions.ADMIN],

    async execute(message: Message) {
        const args = message.content.split(' ')
        if (message.mentions.members.size == 1)
            if (args.includes('изменить')) await assignPermissions(message)
            else await printMemberRoleInfo(message)
        else throw new CommandSyntaxError(this.syntax)
    },
}

export default command
