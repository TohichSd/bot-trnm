/**
 * Дебильные ответ очки
 * @param message
 */
function main(message) {
    if (message.content.toLowerCase() === "а") {
        sendMsg(message.channel, "Хуй на")
    } else if (message.content.toLowerCase() === "чё") {
        sendMsg(message.channel, "Хуй в очё")
    } else if (message.content.toLowerCase() === "чо") {
        sendMsg(message.channel, "Хуй в очо")
    } else if (message.content.toLowerCase().includes("коммунизм")) {
        sendMsg(message.channel, "САЮЮЮЮЗ НЕРУШИМЫЙ РЕСПУЛИК СВАБОООДНЫХ")
    }
}


function sendMsg(channel, text) {
    let len = text.length
    channel.startTyping()
    setTimeout(() => {
        channel.send(text)
        channel.stopTyping()
    }, 400 * len)

}

export default {
    run: main,
    name: "debil"
}