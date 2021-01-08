import applicationsManager from "../helpers/applicationsManager.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"
import {
    MessageEmbed
} from "discord.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

// console.log = function() {}
// console.error = function() {}

function main(msg) {
    return new Promise((resolve, reject) => {
        try {
            applicationsManager.get(msg.guild.id, msg.member.id).then(row => {
                row = row[0]
                if (!row) {
                    msg.reply("У вас ещё нет заявки. Создайте её с помощью !заявка.")
                    resolve()
                    return
                }
                let embed = new MessageEmbed()
                    .setThumbnail("https://i.ibb.co/1Q7pQ94/podacha.png")
                    .setTitle(`**Заявка участника ${msg.member.displayName}**`)
                    .addField(":link: Ссылка на steam:", "\n"+row['link'])
                    .addField(":video_game: Уровень в игре:", "\n"+row['level'])
                    .addField(":man_mage: Возраст:", "\n"+row['age'])
                    .addField(":microphone2: Наличие микрофона:", "\n"+row['micro'])
                    .setColor("#4287f5")
                msg.reply(embed)
                // msg.reply(`Ваша заявка:\nСсылка на steam: ${row['link']}\nУровень в игре: ${row['level']}\nВозраст: ${row['age']}\nНаличие микрофона: ${row['micro']}`)
                resolve()
            })
        } catch (err) {
            reject(err)
            logger.warn(err)
        }
    })
}

export default {
    name: 'моя-заявка',
    run: main,
    description: 'Просмотреть информацию, указанную в вашей заявке'
}