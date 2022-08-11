import ICommand from '../classes/ICommand'
import { Message, MessageEmbed } from 'discord.js'
import { CommandSyntaxError, NotFoundError } from '../../classes/CommandErrors'
import { ClanModel } from '../../models/ClanModel'

const command: ICommand = {
    name: 'клан',
    syntax: '!клан - список кланов\n!клан @участник - переместить участника в клан\n!клан создать @клан\n!клан удалить @клан',
    aliases: ['кланы'],

    async execute(message: Message) {
        const args = message.content.replace(/ +(?= )/g, '').split(' ')
        const clans = await ClanModel.getAllGuildClans(message.guild.id)
        let roles = await Promise.all(
            clans.map(async clan => await message.guild.roles.fetch(clan.role_id))
        )

        // Проверка, что все роли существуют на сервере
        if (roles.includes(null)) {
            await message.reply(
                ':warning: Предупреждение: одна или несколько клановых ролей отсутствуют на сервере. :warning:'
            )
            roles = roles.filter(role => role)
        }

        // Если указана роль
        if (message.mentions.roles.size == 1) {
            if (args.includes('создать')) {
                const clan = new ClanModel({
                    role_id: message.mentions.roles.first().id,
                    guild_id: message.guild.id,
                })
                await clan.save()
                await message.react('✅')
            } else if (args.includes('удалить')) {
                const clan = await ClanModel.getClanByRoleID(message.mentions.roles.first().id)
                if (!clan) throw new NotFoundError(NotFoundError.types.CLAN)
                await clan.markDeleted()
                await message.react('✅')
            }
        } else if (args.length == 1) {
            /* else if (message.mentions.members.size == 1) {
                const interview = new Interview(message.channel as TextChannel, message.member)
    
                const validator = (ans: Message) =>
                    !isNaN(parseInt(ans.content)) &&
                    parseInt(ans.content) >= 1 &&
                    parseInt(ans.content) <= roles.length
    
                const choose = await interview.ask(
                    `Выберите, в какой клан добавить участника (1-${roles.length}):\n${roles
                        .map((role, i) => `${i + 1}. ${role || '(роль не найдена)'}`)
                        .join('\n')}`,
                    { validator }
                )
                const memberData = await MemberModel.getMemberByID(
                    message.guild.id,
                    message.mentions.members.first().id
                )
    
                const currentClan = await ClanModel.findById(memberData.clan)
                const newClan = clans[parseInt(choose.content) - 1]
    
                // Добавить новую роль и убрать старую
                try {
                    if (!message.member.roles.cache.has(newClan.role_id))
                        await message.member.roles.add(newClan.role_id)
                } catch (e) {
                    throw new CommandError(
                        'Error: Cannot add clan role.',
                        'Не удалось выдать роль клана. :frowning2:'
                    )
                }
                try {
                    if (
                        message.member.roles.cache.has(currentClan.role_id) &&
                        newClan.role_id != currentClan.role_id
                    )
                        await message.member.roles.remove(currentClan.role_id)
                } catch (e) {
                    console.error(e)
                }
    
                await memberData.setClan(newClan._id)
    
                await message.reply('Готово!')
            }*/
            const embedClans = new MessageEmbed().setTitle('Список кланов').setColor('#42b9d2')
            await Promise.all(
                clans.map(async clan => {
                    const boolMembers = await Promise.all(
                        message.guild.members.cache.map(async m => {
                            if (m.partial) await m.fetch()
                            return m.roles.cache.has(clan.role_id)
                        })
                    )
                    const membersCount = boolMembers.filter(m => m).length
                    embedClans.addField(
                        '\u200b',
                        `<@&${clan.role_id}>\n${membersCount} участников\n${clan.points} очков`,
                        true
                    )
                })
            )
            await message.reply({ embeds: [embedClans] })
        } else throw new CommandSyntaxError(this.syntax)
    },
}

export default command
