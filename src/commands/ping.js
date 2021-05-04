/**
 * @param {object} message Сообщение
 */
async function main(message) {
  message.channel.send("Pong")
}

const ping = {
  name: "ping",
  run: main,
  description: "Просто пинг",
  showhelp: false,
}

export default ping
