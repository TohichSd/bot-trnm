/**
 * @module new-application
 */

import applicationsManager from "../helpers/applicationsManager.js"
import dfname from "../../utils/__dfname.js"
import winston_logger from "../../modules/logger/index.js"
import Interview from "../helpers/Interview.js"
import DAO from "../../modules/db/index.js";

const logger = new winston_logger(dfname.dirfilename(
    import.meta.url), true)

// console.log = function() {}
// console.error = function() {}
/**
 * Создать заявку
 * @param {object} msg message
 */
function main(msg) {
    return new Promise((resolve, reject) => {
        try {
            //Если канал не является кналом для заполнения заявок, отменить создание заявки
            DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
                $guild_id: msg.guild.id
            }).then(guildParams => {
                if(guildParams["new_app_channel"] && guildParams["new_app_channel"] !== msg.channel.id) {
                    msg.reply(`Заполняйте заявку только в канале <#${guildParams["new_app_channel"]}>`)
                    resolve()
                    return
                }

                const filter = m => m.member.id === msg.member.id
                new Interview({
                    link: "Укажите ссылку на ваш steam",
                    level: "Какой у вас уровень в игре?",
                    age: "Сколько вам лет?",
                    micro: "Есть ли у вас микрофон?"
                }, msg.channel, filter, {
                    cancel: "Отмена создания заявки",
                    start: "Создание заявки. Для отмены введите !отмена"
                })
                    .start()
                    .then(params => {
                        applicationsManager.set(msg.member.id, msg.guild.id, params.link, params.level, params.age, params.micro).then(() => {
                            logger.info(`New application ${msg.member.id}, ${msg.guild.id}, ${params.link}, ${params.level}, ${params.age}, ${params.micro}`)
                            msg.reply("Заявка создана!")
                            resolve()
                        })

                    })
                    .catch(err => {
                        logger.warn(err.stack)
                        logger.info(`While creating new application: ${err.stack}`)
                        resolve()
                    })
            })
        } catch (err) {
            logger.error(err.stack)
            reject(err)
        }
    })
}

export default {
    name: "заявка",
    run: main,
    description: "Создать или изменить заявку на участие в турнирах. Бот запомнит её.",
    permissions: 0
}