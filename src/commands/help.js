import { readdir } from "fs"
import { MessageEmbed } from 'discord.js'

const main = async (message, permissions) => {
  const embed = new MessageEmbed()
    .setTitle('Команды')
    .setColor('#fffa00')
  await readdir("./src/commands/", async (err, files) => {
    const promises = files.map(async (file) => {
      if (file === "index.js") return
      await import(`./${file}`).then((obj) => {
        if (obj.default && obj.default.showhelp !== false) {
          if (!obj.default.permissions || permissions >= obj.default.permissions)
            embed
              .addField(obj.default.name, `${obj.default.description}\n${obj.default.syntax || ''}`)
        }
      })
    })
    await Promise.all(promises)
    message.channel.send(embed)
  })
}
export default {
  run: main,
  name: "help",
  description: "Информация о всех командах",
}
