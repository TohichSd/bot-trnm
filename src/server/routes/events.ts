import { Router } from 'express'
import { EventModel } from '../../models/EventModel'
import Bot from '../../discord/Bot'
import * as moment from 'moment-timezone'
import { StatusCodes } from 'http-status-codes'
import { HTTPError } from '../../classes/CommandErrors'
import Logger from '../../classes/Logger'
import { v4 as uuid } from 'uuid'
import { Config } from '../../config/BotConfig'
import Server from '../Server'
import Permissions = Config.Permissions
import { GuildModel } from '../../models/GuildModel'

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
            datetime
        }
    })
    res.render('events', {
        manageEventsPermission,
        guild,
        new_events,
        username: req.session.username
    })
})

router.get(
    '/guild/:guild_id/events/create',
    Server.getInstance().checkPermissions([Permissions.MANAGE_EVENTS]),
    async (req, res) => {
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
            imageUrl: decodeURIComponent(req.query.imageUrl.toString())
        }
        res.render('createEvent', {
            guild,
            csrfToken: req.session.csrfToken,
            defaults,
            username: req.session.username
        })
    }
)

router.post(
    '/guild/:guild_id/events/create',
    Server.getInstance().checkPermissions([Permissions.MANAGE_EVENTS]),
    async (req, res, next) => {
        if (req.body.csrfToken != req.session.csrfToken) {
            res.redirect(`/${req.params.guild_id}/events/`)
            return
        }
        if (
            !req.body.name ||
            !req.body.description ||
            !req.body.datetime ||
            !req.body.imageUrl ||
            !req.body.timezone
        ) {
            next(new HTTPError(StatusCodes.BAD_REQUEST))
            return
        }
        const eventsManager = Bot.getInstance().getEventsManager()
        try {
            await eventsManager.createEvent(req.params.guild_id, {
                name: req.body.name,
                description: req.body.description,
                datetimeMs: moment(req.body.datetime)
                    .subtract(moment().tz(req.body.timezone).utcOffset(), 'minutes')
                    .valueOf(),
                imageUrl: req.body.imageUrl
            })
        } catch (e) {
            Logger.warn(e)
        }
        res.render('result', {
            title: 'Готово!',
            message: 'Турнир создан.',
            backLink: '..',
            username: req.session.username
        })
    }
)

router.get(
    '/guild/:guild_id/events/edit',
    Server.getInstance().checkPermissions([Permissions.MANAGE_EVENTS]),
    async (req, res, next) => {
        if (!req.query.id) next(new HTTPError(StatusCodes.BAD_REQUEST))
        const eventData = await EventModel.getEventByMessageID(req.query.id as string)
        const guildData = await GuildModel.getByGuildID(req.params.guild_id)
        if (!eventData) {
            next(
                new HTTPError(
                    StatusCodes.NOT_FOUND,
                    'Такого турнира не существует. Попробуйте снова.',
                    'Турнир не найден'
                )
            )
            return
        }
        if (!guildData) {
            next(
                new HTTPError(
                    StatusCodes.NOT_FOUND,
                    'Такого сервера не существует. Попробуйте снова.',
                    'Сервер не найден'
                )
            )
            return
        }
        res.render('editEvent', {
            guild: await Bot.getInstance().getGuild(req.params.guild_id),
            defaults: {
                name: eventData.name,
                description: eventData.description,
                imageUrl: eventData.imageUrl,
                datetime: moment(eventData.datetimeMs)
                    .tz(guildData.timezone || 'Europe/Moscow')
                    .format('YYYY-MM-DDTHH:mm')
            }
        })
    }
)

router.post(
    '/guild/:guild_id/events/edit',
    Server.getInstance().checkPermissions([Permissions.MANAGE_EVENTS]),
    async (req, res, next) => {
        if (req.body.csrfToken != req.session.csrfToken) {
            res.redirect(`/${req.params.guild_id}/events/`)
            return
        }
        if (
            !req.body.name ||
            !req.body.description ||
            !req.body.datetime ||
            !req.body.imageUrl ||
            !req.body.timezone
        ) {
            next(new HTTPError(StatusCodes.BAD_REQUEST))
            return
        }

        const editOptions = {
            name: req.body.name,
            description: req.body.description,
            datetime: moment(req.body.datetime)
                .subtract(moment().tz(req.body.timezone).utcOffset(), 'minutes')
                .valueOf(),
            imageUrl: req.body.imageUrl
        }

        if (!req.query.id) return next(new HTTPError(StatusCodes.BAD_REQUEST))
        try {
            const em = await Bot.getInstance().getEventsManager()
            await em.editEvent(req.params.guild_id, req.params.id, editOptions)
            res.render('result', {
                title: 'Готово!',
                message: 'Турнир создан.',
                backLink: '..',
                username: req.session.username
            })
        }
        catch (e) {
            next(new Error('Error while editing event ' + req.params.id))
        }
    }
)

export default router
