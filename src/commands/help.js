import { readdir } from "fs"

const main = async (msg, role) => {
  let answer = "```diff\n"
  await readdir("./bot/commands/", async (err, files) => {
    const promises = files.map(async (file) => {
      if (file === "index.js") return
      await import(`./${file}`).then((obj) => {
        if (obj.default && obj.default.showhelp !== false) {
          if (!obj.default.permissions || role >= obj.default.permissions)
            answer += `!${obj.default.name} - ${obj.default.description}\n`
        }
      })
    })
    await Promise.all(promises)
    answer += "```"
    msg.channel.send(answer)
  })
}
export default {
  run: main,
  name: "help",
  description: "Информация о всех командах",
}
