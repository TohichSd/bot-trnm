/**
 * Дебильные ответ очки
 * @param message
 */
async function main(message) {
    if (message.content.toLowerCase().includes("коммунизм")) {
        await sendMsg(message.channel, "САЮЮЮЮЗ НЕРУШИМЫЙ РЕСПУЛИК СВАБОООДНЫХ")
        message.channel.send({files: ["https://i.ibb.co/sjLd17x/18-1924.png"]})
    }
}


function sendMsg(channel, text) {
    return new Promise((resolve, reject) => {
        try {
            let len = text.length
            channel.startTyping()
            setTimeout(() => {
                channel.send(text)
                channel.stopTyping()
                resolve()
            }, 100 * len)
        } catch (err) {
            reject(err)
        }
    })
}

export default {
    run: main,
    name: "debil"
}