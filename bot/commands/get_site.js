/**
 * @module site
 */

/**
 *
 * @param {object} msg Сообщение
 */
function main(msg) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        try {
            msg.channel.send("https://arm-bot.eu.openode.io")
            resolve()
        } catch (err) {
            reject(err);
        }
    })
}

export default {
    name: "сайт",
    run: main,
    description: "Панель управления",
    permissions: 1
}