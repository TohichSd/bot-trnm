import { Router } from 'express'
import { Event, EventModel } from '../../models/EventModel'
import * as moment from 'moment-timezone'
import { APIError } from '../../classes/CommandErrors'
import { StatusCodes } from 'http-status-codes'
import { DocumentType } from '@typegoose/typegoose'

const router = Router()

router.get('/api/:guild_id/events', async (req, res, next) => {
    const type = req.query.type || 'all'
    if (type == 'new') {
        const new_events = (await EventModel.getNewGuildEvents(req.params.guild_id)).map(event => {
            const datetime = moment(event.datetimeMs).locale('ru').calendar()
            return {
                name: event.name,
                description:
                    event.description.slice(0, 100) + (event.description.length > 100 ? '...' : ''),
                imageUrl: event.imageUrl,
                _id: event._id,
                datetime,
            }
        })
        res.json(new_events)
    } else if (type == 'old') {
        const old_events = (await EventModel.getOldGuildEvents(req.params.guild_id)).map(event => {
            const datetime = moment(event.datetimeMs).locale('ru').format('LLLL')
            return {
                name: event.name,
                description: event.description,
                imageUrl: event.imageUrl,
                _id: event._id,
                datetime,
            }
        })
        res.json(old_events)
    } else if (type == 'all') {
        const events = (await EventModel.getAllGuildEvents(req.params.guild_id)).map(event => {
            const datetime = moment(event.datetimeMs).locale('ru').format('LLLL')
            return {
                name: event.name,
                description: event.description,
                imageUrl: event.imageUrl,
                _id: event._id,
                datetime,
            }
        })
        res.json(events)
    } else next(new APIError(StatusCodes.BAD_REQUEST))
})

router.get('/api/:guild_id/events/:event_id', async (req, res, next) => {
    let event: DocumentType<Event>
    try {
        event = await EventModel.findById(req.params.event_id)
    } catch (e) {
        event = undefined
    }
    if (!event) {
        next(new APIError(StatusCodes.NOT_FOUND, `Event ${req.params.event_id} does not exist`))
        return
    }
    const datetime = moment(event.datetimeMs).locale('ru').format('LLLL')
    res.json({
        name: event.name,
        description: event.description,
        imageUrl: event.imageUrl,
        datetimeMs: event.datetimeMs,
        message_id: event.message_id,
        _id: event._id,
        datetime,
    })
})

export default router
