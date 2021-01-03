/**
 * @module ping
 */

/**
 * 
 * @param {object} message Сообщение
 */
function main(msg) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        try {
            msg.channel.send("Pong")
            resolve()
        } catch (err) {
            reject(err);
        }
    })
}

const ping = {
    name: "ping",
    run: main,
    description: "Просто пинг",
    showhelp: false
}

export default ping