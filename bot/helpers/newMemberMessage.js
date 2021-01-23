import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js"
import dfname from "../../utils/__dfname.js"
import {MessageEmbed} from "discord.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

async function main(member) {
    let helloChannelId
    let newAppChannelId
    await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
        $guild_id: member.guild.id
    }).then(result => {
        helloChannelId = result["hello_channel"]
        newAppChannelId = result["new_app_channel"]
    }).catch(err => logger.warn(err))
    let channel = member.guild.channels.cache.find(c => c.id === helloChannelId)
    let message = new MessageEmbed()
        .setTitle(`Привет, ${member.displayName}`)
        .setColor("#f50000")
        .setDescription(":ballot_box_with_check: **Этот сервер посвящён игре Armello и здесь регулярно проводятся турниры по ней.**\n\n:information_source: **О правилах сервера ты можешь узнать в канале #правила**")
    if (newAppChannelId)
        message.addField(":arrow_forward: В турнирах может участвовать каждый", `Для этого тебе нужно написать !заявка в канале <#${newAppChannelId}> и ответить на вопросы.`)
    else
        message.addField(":arrow_forward: В турнирах может участвовать каждый", "Для этого тебе нужно написать !заявка и ответить на вопросы.")
    message.setImage("https://i.gifer.com/1ZNH.gif")

    channel.send(`<@${member.id}>`)
    channel.send(message)
}

export default {
    name: 'newMemberMessage',
    run: main
}
