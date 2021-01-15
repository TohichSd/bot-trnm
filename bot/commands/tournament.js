/**
 * @module cmd-tournament
 */

import Tournament from "../helpers/tournament.js"
import Interview from "../helpers/Interview.js"


// console.log = function() {}
// console.error = function() {}
function main(msg) {
    return new Promise((resolve, reject) => {
        try {
            const filter = m => m.member.id === msg.member.id
            new Interview({
                    name: "Укажите название турнира",
                    description: "Напишите описание турнира",
                    loot: "Какие награды за победу?",
                    date: "Укажите дату проведения",
                    // channelsTrnm: "В какие каналы будет отправлена информация о турнире (используйте #упоминание)",
                    // channelsMembers: "В какие каналы сообщать о новом участнике (используйте #упоминание)"
                }, msg.channel, filter)
                .start()
                .then((result) => {
                    new Tournament({
                        name: result.name.content,
                        description: result.description.content,
                        loot: result.loot.content,
                        date: result.date.content,
                        guild: msg.guild,
                    })
                    resolve()
                })
                .catch((err) => {
                    console.error(err)
                    resolve()
                })
        } catch (err) {
            console.error(err)
            reject(err)
        }
    })
}
export default {
    run: main,
    name: 'турнир',
    description: 'Создать новый турнир',
    permissions: 1
}