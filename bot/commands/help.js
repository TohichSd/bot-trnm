import {
    readdir
} from "fs"

console.log = function() {}
console.error = function() {}

function main(msg, role) {
    return new Promise((resolve, reject) => {
        try {
            let args = msg.content.split(" ")
            if(args[1] === "m") role = 0
            let answer = "```diff\n"
            readdir('./bot/commands/', async (err, files) => {
                for (const file of files) {
                    if (file !== 'index.js') {
                        await import(`./${file}`)
                            .then(obj => {
                                if (obj.default && obj.default.showhelp !== false) {
                                    if (!obj.default.permissions || role >= obj.default.permissions)
                                        answer += `!${obj.default.name} - ${obj.default.description}\n`
                                }
                            })
                    }
                }
                answer += "```"
                msg.channel.send(answer)
                resolve()
            })
        } catch (err) {
            reject(err)
        }
    })
}
export default {
    run: main,
    name: 'help',
    description: "Информация о всех командах"
}