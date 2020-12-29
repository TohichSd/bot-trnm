/**
 * @module restart-reaction-listener
 * NOT USING
 */
import DAO from "../../modules/db/index.js"

/**
 * Добавляет слушателей реакций для всех последних сообщений о турнирах для всех серверов
 * @param {object} guilds client.guilds
 */
async function main(guilds) {
    DAO.all("SELECT * FROM guilds").then(row => {
        for (const guild_row of row) {
            if(!guild_row['lastChannelID'] || !guild_row['lastMessageID']) continue
            const channels = guild_row['lastChannelID'].split(',')
            const messages = guild_row['lastMessageID'].split(',')
            const guild = guilds.cache.get(guild_row['guild_id'])
            let i = 0
            for (const channelID of channels) {
                let channel = guild.channels.cache.get(channelID)
                let msg = channel.messages.cache.get(messages[i])
                console.log(channel)
                i++
                const collector = msg.createReactionCollector((reaction) => reaction.emoji.name === `✅`, {
                    time: 432000
                })
                //При добавлении эмодзи, выполнить следующее
                collector.on("collect", async (reaction, user) => {
                    if (user.bot) return
                    let member = channel.guild.members.cache.find(member => member.user.id === user.id)
                    //Проверка наличия участника в турнире
                    DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event", {
                        $id: member.id,
                        $guild_id: member.guild.id,
                        $event: guild_row['lastEventID']
                    }).then(rowMember => {
                        //Если участник найден, прекратить
                        if (rowMember != undefined) return
                        //Иначе добавить участника в турнир
                        DAO.run("INSERT INTO members (id, guild_id, event) VALUES ($id, $guild_id, $event)", {
                            $id: member.id,
                            $guild_id: member.guild.id,
                            $event: guild_row['lastEventID']
                        })
                        //Послать сообщения об участии в перечисленные каналы
                        channel.send(`<@${member.id}> принимает участие в турнире ${guild_row['name']}!`)
                    })
                })
            }
        }
    })
}

// export default {
//     name: 'restartReactionListener',
//     run: main
// }