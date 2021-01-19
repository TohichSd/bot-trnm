import DAO from "../../modules/db/index.js"
import winston_logger from "../../modules/logger/index.js";
import dfname from "../../utils/__dfname.js";
import tournamentListener from "./reactionListener.js"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))
let events

/**
 * Вызвать при добавлении реакции на сообщение с турниром
 * @param reaction реакция
 * @param user пользовательЮ добавивший реакцию
 * @returns {Promise<void>}
 */
async function main(reaction, user) {
    if(!events) await cache_events()
    if (reaction.message.partial) await reaction.message.fetch()
    const event = events.find(e => e.message_id === reaction.message.id)
    await tournamentListener(reaction.message.guild, reaction.message.channel, event.id, user, event.name)
}

/**
 * Кэшировать турниры из бд
 * @returns {Promise<void>}
 */
async function cache_events() {
    const time = new Date().getTime()
    await DAO.all("SELECT * FROM events WHERE datetimeMs > $time", {
        $time: time
    })
        .then(row => events = row)
}

export default {
    name: 'onReactionAdd',
    run: main,
    cache_events: cache_events
}