import express from "express"
import pug from "pug"
import fetch from "node-fetch"
import {env} from "process"
import {getUserGuilds, isMemberAdmin} from "../bot.js"

const router = express.Router()
// Параметры рендера странцы
let renderOptions = {}

const onlyAuth = (req, res, next) => {
  if (req.session.auth !== true) {
    res.redirect("/ds-auth")
    return
  }
  next()
}

const onlyUnauthorized = (req, res, next) => {
  if (req.session.auth === true) {
    res.redirect("/")
    return
  }
  next()
}

const onlyGuildAdmin = (req, res, next) => {
  isMemberAdmin(req.session.userID, req.params.id)
    .then((result) => {
      if (result) next()
      else res.redirect("/ds-auth")
    })
    .catch(err => {
      next(err)
    })
}

// Обновление параметров рендера страницы
router.use((req, res, next) => {
  renderOptions = {}
  renderOptions.auth = !!req.session.auth
  renderOptions.username = req.session.username
  renderOptions.csrf = req.session.csrfToken
  next()
})

router.use((req, res, next) => {
  if(req.method === "POST") {
    if(req.body.csrf !== req.session.csrfToken) {
      const err = new Error("Csrf token is invalid")
      err.statusCode = 400
      throw err
    }
  }
  next()
})

// Для тестирования работы сервера
router.get("/ping", (req, res) => {
  res.json({status: "pass"})
})

// Авторизация пользовательля с помощью Discord OAuth2
router.get("/auth", onlyUnauthorized, async (req, res, next) => {
  // Данные для получения информации о пользователе из Discord
  const data = {
    client_id: env.D_CLIENT_ID,
    client_secret: env.D_CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: `${req.protocol}://${req.get("host")}${req.route.path}`,
    code: req.query.code,
    scopes: "identify%20guilds",
  }

  // Данные для получения информации о пользователе
  let accessData = {}
  await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams(data),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((_accessData) => _accessData.json())
    .then((_accessData) => {
      accessData = _accessData
    })

  // Информация о пользователе
  let userData = {}
  await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${accessData.token_type} ${accessData.access_token}`,
    },
  }).then((_userData) => {
    userData = _userData
  })

  if (userData.status !== 200) {
    req.session.auth = false
    next(403)
  } else {
    userData = await userData.json()
    req.session.auth = true
    req.session.username = `${userData.username}#${userData.discriminator}`
    req.session.userID = userData.id
    res.redirect("/")
  }
})

// Страница авторизации
router.get("/ds-auth", onlyUnauthorized, (req, res) => {
  res.send(
    pug.renderFile("server/views/ds-auth.pug", {auth_link: env.D_AUTH_URL})
  )
})

// Выход из сессии
router.get("/logout", (req, res) => {
  req.session.auth = null
  req.session.username = null
  res.redirect("/ds-auth")
})

// Главная (выбор сервера)
router.get("/", onlyAuth, (req, res) => {
  getUserGuilds(req.session.userID).then((guilds) => {
    renderOptions.guilds = guilds
    res.send(pug.renderFile("server/views/choose-server.pug", renderOptions))
    renderOptions.guilds = null
  })
})

router.get("/guild/:id", onlyAuth, onlyGuildAdmin, (req, res) => {
  res.send(pug.renderFile("server/views/controls.pug", renderOptions))
})

router.get("/guild/:id/new", onlyAuth, onlyGuildAdmin, (req, res) => {
  res.send(pug.renderFile("server/views/new.pug", renderOptions))
})

export default router