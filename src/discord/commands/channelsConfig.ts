import { Message, MessageEmbed } from 'discord.js'
import ICommand from 'discord/classes/ICommand'
import { Config } from '../../config/BotConfig'
import Permissions = Config.Permissions
import { CommandError, CommandSyntaxError } from '../../classes/CommandErrors'
import { GuildModel } from '../../models/GuildModel'

const command: ICommand = {
    name: 'каналы',
    description: 'Список каналов, используемых ботом',
    syntax: '!каналы | !каналы [имя канала] [#канал]',
    permissions: [Permissions.ADMIN],

    async execute(message: Message) {
        const args = message.content.replace(/ +(?= )/g, '').split(' ')
        if (args.length > 3 || args.length == 2) throw new CommandSyntaxError(this.syntax)
        const channels = Object.keys(Config.channelsNames)
        const guildData = await GuildModel.getByGuildID(message.guild.id)

        if (args.length == 1) {
            const embed = new MessageEmbed()
                .setTitle('Список каналов, используемых ботом')
                .setColor('#a9ff9f')
                .setDescription(
                    channels
                        .filter(ch => !!guildData.channels[ch])
                        .map(
                            (ch, i) =>
                                `${i + 1}. <#${guildData.channels[ch]}> - ${
                                    Config.channelsNames[ch] || '[нет названия] ' + ch
                                } **(${ch})**`
                        )
                        .join('\n')
                )
            await message.reply({ embeds: [embed] })
        } else if (args.length == 3 && message.mentions.channels.size == 1) {
            const channelMention = message.mentions.channels.first()
            if (!Config.channelsNames[args[1]])
                throw new CommandError('Invalid argument value', 'Неверное имя канала')
            guildData.channels[args[1]] = channelMention.id
            await guildData.save()
            await message.react('✅')
        }
    },
}

export default command
