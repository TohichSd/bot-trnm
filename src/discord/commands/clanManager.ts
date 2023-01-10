import ICommand from '../classes/ICommand'
import { Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js'
import { CommandSyntaxError, NotFoundError } from '../../classes/CommandErrors'
import { ClanModel } from '../../models/ClanModel'
import Interview from '../classes/Interview'
import { GuildModel } from '../../models/GuildModel'
import { env } from 'process'

const command: ICommand = {
    name: 'клан',
    syntax: '!клан - список кланов\n!клан @участник - переместить участника в клан\n!клан создать\n!клан удалить @клан',
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

        const guildData = await GuildModel.getByGuildID(message.guild.id)

        // Если указана роль

        if (args.includes('создать')) {
            const interview = new Interview(message.channel as TextChannel, message.member)
            const role = await interview.ask('Укажите роль клана', {
                validator: m => m.mentions.roles.size == 1,
            })
            const image = await interview.ask('Отправьте картинку клана', {
                validator: m => m.attachments.size == 1,
            })
            const imgChannel = (await message.guild.channels.fetch(
                guildData.channels.game_report_images_channel
            )) as TextChannel
            const sentMessage = await imgChannel.send({ files: [image.attachments.first().url] })
            const clan = new ClanModel({
                role_id: role.mentions.roles.first().id,
                guild_id: message.guild.id,
                imageUrl: sentMessage.attachments.first().url,
            })
            await clan.save()
            await message.react('✅')
        } else if (message.mentions.roles.size == 1) {
            if (args.includes('удалить')) {
                const clan = await ClanModel.getClanByRoleID(message.mentions.roles.first().id)
                if (!clan) throw new NotFoundError(NotFoundError.types.CLAN)
                await clan.markDeleted()
                await message.react('✅')
            }
        } else if (args.length == 1) {
            const embedClans = new MessageEmbed().setTitle('Список кланов').setColor('#42b9d2')
            await Promise.all(
                clans.map(async clan => {
                    await message.guild.members.fetch()
                    
                    const clanRole = await message.guild.roles.fetch(clan.role_id)
                    const membersCount = clanRole.members.size
                    embedClans.addField(
                        '\u200b',
                        `<@&${clan.role_id}>\n${membersCount} участников\n${clan.points} очков`,
                        true
                    )
                })
            )

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setURL(new URL(`/guild/${message.guild.id}/clans/`, env.SELF_URL).href)
                    .setLabel('Посмотреть на сайте сервера')
                    .setStyle('LINK')
            )
            
            await message.reply({ embeds: [embedClans], components: [row] })
        } else throw new CommandSyntaxError(this.syntax)
    },
}

export default command
