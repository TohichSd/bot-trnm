import { v4 } from 'uuid'
import ICommand from '../classes/ICommand'
import { Message } from 'discord.js'
import { Config } from '../../config/BotConfig'
import Permissions = Config.Permissions
import { AccessTokenModel } from '../../models/AccessTokenModel'
import { env } from 'process'
import { CommandError } from '../../classes/CommandErrors'

const command: ICommand = {
    name: 'войти',
    description: 'Войти в панель управления ботом',
    permissions: [Permissions.ACCESS_DASHBOARD],

    async execute(message: Message): Promise<void> {
        await AccessTokenModel.updateMany({ member_id: message.member.id }, { disabled: true })
        const accessToken = new AccessTokenModel({
            token: v4(),
            member_id: message.member.id,
            created_at: Date.now().valueOf(),
        })
        await accessToken.save()
        try {
            const channel = await message.member.createDM()
            await channel.send(
                'Вот ваша ссылка для входа:\n' +
                    `${new URL('/login', env.SELF_URL)}?token=${accessToken.token}` +
                    '\nОна действует 24 часа. При получении новой ссылки все старые перестанут работать.'
            )
        } catch (e) {
            throw new CommandError(
                'Cannot send DM message',
                'Не получилось отправить ссылку в ЛС. Попробуйте ещё раз.'
            )
        }
        await message.react('✅')
    },
}

export default command
