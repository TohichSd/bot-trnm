import applicationsManager from "../helpers/applicationsManager.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

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
                msg.reply(`Ваша заявка:\nСсылка на steam: ${row['link']}\nУровень в игре: ${row['level']}\nВозраст: ${row['age']}\nНаличие микрофона: ${row['micro']}`)
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