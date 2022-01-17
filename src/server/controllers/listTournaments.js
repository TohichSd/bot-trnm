import pug from 'pug'
import { EventModel } from '../../db/models.js'

export default async (req, res) => {
  /**
   * @type {Array<EventModel>}
   */
  const events = await EventModel.findByGuildID(req.params.id)
  // const currentEvents = events.filter(e => e.datetimeMs > new Date().getMilliseconds())
  res.send(pug.renderFile('src/server/views/list-events.pug', {
    auth: !!req.session.auth,
    username: req.session.username,
    csrf: req.session.csrfToken,
    events: events,
    guild_id: req.params.id
  }))
}