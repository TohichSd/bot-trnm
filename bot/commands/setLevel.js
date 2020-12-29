import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

function main(msg) {
    return new Promise((resolve, reject) => {
        try {
            DAO.get(`SELECT * FROM applications WHERE guild_id = $guild_id AND id = $id`, {
                    $guild_id: msg.guild.id,
                    $id: msg.member.id,
                })
                .then(row => {
                    if (row == undefined) {
                        msg.reply("У вас ещё нет заявки. Создайте её с помощью !заявка")
                        resolve()
                        return
                    }
                    let level = msg.content.split(" ")[1]
                    DAO.run(`UPDATE applications SET level = $level WHERE id = $id AND guild_id = $guild_id`, {
                            $guild_id: msg.guild.id,
                            $id: msg.member.id,
                            $level: level
                        })
                        .then(() => logger.debug("Application updated"))
                        .catch(err => logger.warn(err.stack))
                    msg.reply("Теперь уровень - " + level)
                    resolve()
                })
        } catch (err) {
            reject(err)
            logger.warn(err)
        }
    })
}

export default {
    name: "заявка-уровень",
    run: main,
    description: "Изменить уровень в заявке на турниры."
}