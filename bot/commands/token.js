/**
 * @module token
 */

import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"
import uuid from 'uuid'

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

/**
 *
 * @param {object} msg Сообщение
 */
function main(msg) {
    return new Promise((resolve, reject) => {
        try {
            DAO.get("SELECT * FROM roles WHERE id = $id AND guild_id = $guild_id", {
                $id: msg.member.id,
                $guild_id: msg.guild.id
            })
                .then((row) => {
                    if (row["role"] < 1 || row === undefined) {
                        msg.reply("Вы не имеете роли")
                        resolve()
                        return
                    }
                    const token = uuid.v4()
                    DAO.run("UPDATE roles SET token = $token WHERE id=$id AND guild_id = $guild_id", {
                        $token: token,
                        $id: msg.member.id,
                        $guild_id: msg.guild.id
                    })
                    msg.author.createDM()
                        .then((channel) => {
                            channel.send(token)
                                .then(() => msg.reply("Токен отправлен в лс"))
                                .catch(err => {
                                    logger.warn(err)
                                    msg.reply("Произошла ошибка. Возможно вы запретили отправку сообщений от участников этого сервера")
                                    reject(err)
                                })
                        })
                })
            resolve()
        } catch (error) {
            logger.warn(error)
            reject(error)
        }
    })
}

export default {
    name: "токен",
    run: main,
    description: "Получить токен для доступа к сайту управления"
}