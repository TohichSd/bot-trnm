import express from 'express'
import pug from 'pug'
import {env} from 'process'
import {getUserGuilds} from '../bot.js'
import Oauth from './controllers/oauth.js'
import {
  onlyUnauthorized,
  onlyAuth,
  onlyGuildAdmin,
} from './controllers/commonFunctions.js'
import newTournament from './controllers/newTournament.js'
import listTournaments from './controllers/listTournaments.js'
import {EventModel} from "../db/models.js"
import moment from "moment-timezone"
import editTournament from './controllers/editTournament.js'

const router = express.Router()
// Параметры рендера странцы
let context = {}

// Обновление параметров рендера страницы
router.use((req, res, next) => {
  context = {}
  context.auth = !!req.session.auth
  context.username = req.session.username
  context.csrf = req.session.csrfToken
  context.base_url = env.SELF_URL
  next()
})

router.use((req, res, next) => {
  if (req.method === 'POST') {
    if (req.body.csrf !== req.session.csrfToken) {
      const err = new Error('Csrf token is invalid')
      err.statusCode = 400
      throw err
    }
  }
  next()
})

// Для тестирования работы сервера
router.get('/ping', (req, res) => {
  res.json({status: 'pass'})
})

// Авторизация пользовательля с помощью Discord OAuth2
router.get('/auth', onlyUnauthorized, Oauth)

// Страница авторизации
router.get('/ds-auth', onlyUnauthorized, (req, res) => {
  res.send(
    pug.renderFile('src/server/views/ds-auth.pug', {
      auth_link: env.D_AUTH_URL,
    })
  )
})

// Выход из сессии
router.get('/logout', (req, res) => {
  req.session.auth = null
  req.session.username = null
  res.redirect('/ds-auth')
})

// Главная (выбор сервера)
router.get('/', onlyAuth, (req, res) => {
  getUserGuilds(req.session.userID).then(guilds => {
    context.guilds = guilds
    res.send(
      pug.renderFile('src/server/views/choose-server.pug', context)
    )
    context.guilds = null
  })
})

router.get('/guild/:id', onlyAuth, onlyGuildAdmin, (req, res) => {
  res.send(pug.renderFile('src/server/views/controls.pug', {... context, guild_id: req.params.id}))
})

router
  .route('/guild/:id/new')
  .get(onlyAuth, onlyGuildAdmin, (req, res) => {
    res.send(
      pug.renderFile('src/server/views/new.pug', {
        ... context,
        guild_id: req.params.id,
      })
    )
  })
  .post(onlyAuth, onlyGuildAdmin, newTournament, (req, res) => {
    res.send(
      pug.renderFile('src/server/views/tournament-done.pug', {
        ... context,
        guild_id: req.params.id,
      })
    )
  })


router.route('/guild/:id/events').get(onlyAuth, onlyGuildAdmin, listTournaments)

router
  .route('/guild/:id/events/:e_id/edit')
  .get(onlyAuth, onlyGuildAdmin, async (req, res) => {
    const event = await EventModel.findById(req.params.e_id)
    const dt = moment(event.datetimeMs).tz('Europe/Moscow').format('YYYY-MM-DDTHH:mm')
    res.send(
      pug.renderFile('src/server/views/edit-tournament.pug', {
        ... context,
        guild_id: req.params.id,
        trnm: {
          name: event.name,
          description: event.description,
          loot: event.loot,
          datetime: dt,
          isRandom: event.isRandom,
        }
      })
    )
  })
  .post(onlyAuth, onlyGuildAdmin, editTournament, (req, res) => {
    res.send(
      pug.renderFile('src/server/views/tournament-done.pug', {
        ... context,
        guild_id: req.params.id,
      })
    )
  })

export default router
