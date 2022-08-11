import { Router } from 'express'
import { EventModel } from '../../models/EventModel'
import Bot from '../../discord/Bot'
import * as moment from 'moment-timezone'
import { StatusCodes } from 'http-status-codes'
import { HTTPError } from '../../classes/CommandErrors'
import Logger from '../../classes/Logger'
import { v4 as uuid } from 'uuid'
import { Config } from '../../config/BotConfig'
import Permissions = Config.Permissions

const router = Router()

const checkPermissions = async (guildID, memberID) => {
    if (!memberID) {
        return false
    }
    const permissions = await Bot.getInstance().getMemberPermissions(guildID, memberID)
    return (
        permissions.includes(Permissions.MANAGE_EVENTS) || permissions.includes(Permissions.ADMIN)
    )
}

router.get('/guild/:guild_id/events', async (req, res) => {
    let manageEventsPermission = false
    if (await checkPermissions(req.params.guild_id, req.session.member_id)) {
        manageEventsPermission = true
    }
    const bot = Bot.getInstance()
    const guild = await bot.getGuild(req.params.guild_id)
    const new_events = (await EventModel.getNewGuildEvents(req.params.guild_id)).map(event => {
        const datetime = moment(event.datetimeMs).locale('ru').calendar()
        return {
            name: event.name,
            description:
                event.description.slice(0, 100) + (event.description.length > 100 ? '...' : ''),
            imageUrl: event.imageUrl,
            datetime,
        }
    })
    res.render('events', {
        manageEventsPermission,
        guild,
        new_events,
        username: req.session.username,
    })
})

router.get('/guild/:guild_id/events/create', async (req, res, next) => {
    if (!(await checkPermissions(req.params.guild_id, req.session.member_id))) {
        next()
        return
    }

    req.session.csrfToken = uuid()
    const bot = Bot.getInstance()
    const guild = await bot.getGuild(req.params.guild_id)
    req.query.name = req.query.name || ''
    req.query.description = req.query.description || ''
    req.query.datetimeMs = req.query.datetimeMs || ''
    req.query.imageUrl = req.query.imageUrl || ''
    const defaults = {
        name: decodeURI(req.query.name.toString()),
        description: decodeURI(req.query.description.toString()),
        datetimeMs: moment(parseInt(decodeURI(req.query.datetimeMs.toString()))).toISOString(),
        imageUrl: decodeURIComponent(req.query.imageUrl.toString()),
    }
    res.render('createEvent', {
        guild,
        csrfToken: req.session.csrfToken,
        defaults,
        username: req.session.username,
    })
})

router.post('/guild/:guild_id/events/create', async (req, res, next) => {
    if (!(await checkPermissions(req.params.guild_id, req.session.member_id))) {
        next()
        return
    }

    if (req.body.csrfToken != req.session.csrfToken) {
        res.redirect(`/${req.params.guild_id}/events/`)
        return
    }
    if (!req.body.name || !req.body.description || !req.body.datetime || !req.body.imageUrl) {
        next(new HTTPError(StatusCodes.BAD_REQUEST))
        return
    }
    const eventsManager = Bot.getInstance().getEventsManager()
    try {
        await eventsManager.createEvent(req.params.guild_id, {
            name: req.body.name,
            description: req.body.description,
            datetimeMs: moment(req.body.datetime).valueOf(),
            imageUrl: req.body.imageUrl,
        })
    } catch (e) {
        Logger.warn(e)
    }
    res.render('result', {
        title: 'Готово!',
        message: 'Турнир создан.',
        backLink: '..',
        username: req.session.username,
    })
})

export default router
