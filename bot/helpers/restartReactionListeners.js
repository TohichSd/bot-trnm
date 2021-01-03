/**
 * @module restart-reaction-listener
 * Не используется
 */
import DAO from "../../modules/db/index.js"

/**
 * Добавляет слушателей реакций для всех последних сообщений о турнирах для всех серверов
 * @param {object} guilds client.guilds
 */
async function main(guilds) {
    for await (let guild of guilds.cache) {
        guild = guild[1]
        let event_id = ""
        await DAO.get("SELECT * FROM guilds WHERE guild_id = $guild_id", {
            $guild_id: guild.id
        }).then(guild_row => {
            if (guild_row === undefined) return;
            event_id = guild_row["lastEventID"]
        })
        if (event_id === undefined) continue;
        let event = {}
        await DAO.get("SELECT * FROM events WHERE id = $event_id", {
            $event_id: event_id
        }).then(event_row => {
            event = event_row
        })
        if (event === undefined) continue;
        let channelsID = event["channel_id"].split(',')
        for await (let channelID of channelsID) {
            let channel = guild.channels.cache.get(channelID)
            let message
            await channel.messages.fetch(event["message_id"]).then(msg => message = msg)
            let channelsToSendID = event["channelsToSendID"].split(',')
            let collector = message.createReactionCollector((reaction) => reaction.emoji.name === `✅`, {
                time: 432000
            })
            let feedbackChannel = guild.channels.cache.get(event["feedbackChannel"])
            let member
            collector.on("collect", async (reaction, user) => {
                if (user.bot) return
                let member_id = guild.members.cache.find(member => member.user.id === user.id).id
                //Проверка наличия участника в турнире
                await DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event", {
                    $id: member_id,
                    $guild_id: guild.id,
                    $event: (event_id + 1).toString(),
                }).then(rowMember => {
                    member = rowMember
                })
                //Если участник найден, прекратить
                if (member !== undefined) return
                DAO.get("SELECT * FROM applications WHERE id = $id AND guild_id = $guild_id", {
                    $id: member_id,
                    $guild_id: guild.id,
                }).then(rowApp => {
                    //Иначе добавить участника в турнир
                    if (rowApp === undefined) {
                        feedbackChannel.send("У вас нет заявки! Для создания напишите !заявка.")
                        return
                    }
                    DAO.run("INSERT INTO members (id, guild_id, event) VALUES ($id, $guild_id, $event)", {
                        $id: member_id,
                        $guild_id: guild.id,
                        $event: (event_id + 1).toString()
                    })
                    //Послать сообщения об участии в перечисленные каналы
                    for (let channelTSID of channelsToSendID) {
                        let channelM = guild.channels.cache.get(channelTSID)
                        channelM.send(`<@${member_id}> принимает участие в турнире ${event['name']}!\nСсылка на steam: ${rowApp['link']}\nУровень: ${rowApp['level']}\nВозраст: ${rowApp['age']}\nМикрофон: ${rowApp['micro']}`)
                    }
                })
            })
        }
    }
}

export default {
    name: 'restartReactionListener',
    run: main
}