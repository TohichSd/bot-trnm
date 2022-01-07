import {GuildModel} from "../db/models.js"
import GuildSchema from "../db/GuildSchema.js"
import cachegoose from "cachegoose"

const main = async message => {
  const args = message.content.replace(/ +(?= )/g, '').split(' ')
  if (args.length !== 2) throw new Error('Invalid syntax')
  if (!Object.keys(GuildSchema.obj).includes(args[1]) || !args[1].search('channel')) {
    const error = new Error()
    error.customMessage = 'Неверный ключ'
    throw error
  }
  cachegoose.clearCache(`guild${message.guild.id}`)
  await GuildModel.updateOne({guild_id: message.guild.id}, {[args[1]]: message.channel.id}).exec()
  await message.react('✅')
}

export default {
  run: main,
  name: 'здесь',
  description: 'Установить роль канала',
  permissions: 1,
  syntax: `!здесь <ключ канала> (applications_channel, hello_channel, new_app_channel, tournament_channel,
clan_wars_channel, score_table_channel, game_report_channel, game_report_images_channel)`
}