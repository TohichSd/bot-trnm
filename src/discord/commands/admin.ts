import ICommand from '../classes/ICommand'
import { Config } from '../../config/BotConfig'
import Permissions = Config.Permissions
import { MemberModel } from '../../models/MemberModel'

const command: ICommand = {
    name: 'admin',
    permissions: [Permissions.ADMIN],

    async execute(message) {
        const args = message.content.replace(/ +(?= )/g, '').split(' ')
        if (args.length == 2) {
            if (args[1] === 'update-win-index') {
                await MemberModel.updateGuildWinIndexes(message.guild.id)
                await message.react('✅')
            }
        }
    },
}

export default command