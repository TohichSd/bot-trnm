import { MemberModel } from '../db/dbModels.js'

/**
 * @param {module:"discord.js".Message} message Сообщение
 */
async function main(message) {
  await message.channel.send(await MemberModel.getMaxWins())
  
}

const ping = {
  name: "ping",
  run: main,
  description: "Просто пинг",
  showhelp: false,
}

export default ping
