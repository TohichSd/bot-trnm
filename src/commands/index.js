import { readdir } from "fs"

const exps = {}
readdir("./src/commands/", (err, files) => {
  files.forEach((file) => {
    if (file !== "index.js") {
      import(`./${file}`).then((obj) => {
        if (obj.default) exps[obj.default.name] = obj.default
      })
    }
  })
})

export default exps
