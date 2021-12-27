import express from 'express'
import pug from 'pug'
import { env } from 'process'
import { getUserGuilds, isMemberAdmin } from '../bot.js'
import Oauth from './controllers/oauth.js'
import {
  onlyUnauthorized,
  onlyAuth,
  onlyGuildAdmin,
} from './controllers/commonFunctions.js'
import newTournament from './controllers/newTournament.js'
import listTournaments from './controllers/listTournaments.js'

const router = express.Router()
// Параметры рендера странцы
let renderOptions = {}

// Обновление параметров рендера страницы
router.use((req, res, next) => {
  renderOptions = {}
  renderOptions.auth = !!req.session.auth
  renderOptions.username = req.session.username
  renderOptions.csrf = req.session.csrfToken
  renderOptions.base_url = env.SELF_URL
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
  res.json({ status: 'pass' })
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
    renderOptions.guilds = guilds
    res.send(
      pug.renderFile('src/server/views/choose-server.pug', renderOptions)
    )
    renderOptions.guilds = null
  })
})

router.get('/guild/:id', onlyAuth, onlyGuildAdmin, (req, res) => {
  res.send(pug.renderFile('src/server/views/controls.pug', {...renderOptions, guild_id: req.params.id}))
})

router
  .route('/guild/:id/new')
  .get(onlyAuth, onlyGuildAdmin, (req, res) => {
    res.send(
      pug.renderFile('src/server/views/new.pug', {
        ...renderOptions,
        guild_id: req.params.id,
      })
    )
  })
  .post(onlyAuth, onlyGuildAdmin, newTournament, (req, res, next) => {
    res.send(
      pug.renderFile('src/server/views/tournament-done.pug', {
        ...renderOptions,
        guild_id: req.params.id,
      })
    )
  })


router.route('/guild/:id/list').get(onlyAuth, onlyGuildAdmin, listTournaments)

export default router
