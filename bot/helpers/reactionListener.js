import DAO from "../../modules/db/index.js";
import {MessageEmbed} from "discord.js";
import winston_logger from "../../modules/logger/index.js";
import dfname from "../../utils/__dfname.js";

const logger = new winston_logger(dfname.dirfilename(import.meta.url))

/**
 * @param guild сервер на котором проводится турнир
 * @param channel канал, в который было отправлено сообщение о турнире
 * @param event_id id турнира
 * @param user пользователь, оставивший реакцию
 * @param guildParams настройки сервера из бд
 * @param tounamentName название турнира
 * @returns {Promise<void>}
 */
async function main(guild, channel, event_id, user, guildParams, tounamentName) {
    if (user.bot) return
    //Найти участника в guild.members.cache
    let member = channel.guild.members.cache.find(member => member.user.id === user.id)

    //Найти участника в списке турнира
    let memberData
    await DAO.get("SELECT * FROM members WHERE id = $id AND guild_id = $guild_id AND event = $event", {
        $id: member.id,
        $guild_id: guild.id,
        $event: (event_id + 1).toString(),
    }).then(rowMember => {
        memberData = rowMember
    })
    //Если участник найден, прекратить
    if (memberData !== undefined) return
    //Иначе получить заявку из бд
    let application
    await DAO.get("SELECT * FROM applications WHERE id = $id AND guild_id = $guild_id", {
        $id: member.id,
        $guild_id: guild.id
    }).then(rowApp => {
        application = rowApp
    })
    //Если у участника нет заявки
    if (application === undefined) {
        channel.send("У вас нет заявки! Для создания напишите !заявка.").then(mstd => setTimeout(() => mstd.delete(), 7000))
            .catch((err) => logger.warn(err))
        return
    }

    //Канал для отправки заявок
    let applicationsChannel = guild.channels.cache.get(guildParams["applications_channel"])
    //Сообщение о заявке
    let embedNewTournmMember = new MessageEmbed()
        .setThumbnail("https://i.ibb.co/H4zQ4YB/Check-mark-svg.png")
        .setTitle(`**Заявка участника ${member.displayName} на турнир "${tounamentName}"**`)
        .addField(":link: Ссылка на steam:", application['link'])
        .addField(":video_game: Уровень в игре:", application['level'])
        .addField(":man_mage: Возраст:", application['age'])
        .addField(":microphone2: Наличие микрофона:", application['micro'])
        .setColor("#4287f5")

    //Отправить заявку участника
    applicationsChannel.send(embedNewTournmMember)
    //Добавить участника в базу данных
    DAO.run("INSERT INTO members (id, guild_id, event) VALUES ($id, $guild_id, $event)", {
        $id: member.id,
        $guild_id: guild.id,
        $event: (event_id + 1).toString()
    })
        .catch(error => logger.warn(error))
    logger.info("New member: " + event_id + " : " + member.user.tag)

    //Добавить турнир в бзу данных
}

export default main