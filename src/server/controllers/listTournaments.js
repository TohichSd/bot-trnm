import pug from 'pug'
import { EventModel } from '../../db/dbModels.js'

export default async (req, res) => {
  /**
   * @type {Array<EnforceDocument<unknown, {}>>}
   */
  const events = await EventModel.find({ guild_id: req.params.id }).exec()
  const currentEvents = events.filter(e => e.datetimeMs > new Date().getMilliseconds())
  res.send(pug.renderFile('src/server/views/list.pug', {
    auth: !!req.session.auth,
    username: req.session.username,
    csrf: req.session.csrfToken,
    events: currentEvents,
    guild_id: req.params.id
  }))
}