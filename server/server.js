/**
 * @module server
 * Веб интерфейс для взаиммодействия с ботом
 */

/**
 * Переменные окружения:
 * D_CLIENT_ID - client id из Discord
 * D_CLIENT_SECRET - client secret из Discord
 */

import express from "express"
import { env } from "process"
import {v4 as uuid} from 'uuid'
import session from "express-session"
import bodyParser from "body-parser"
import pug from "pug"
import helmet from 'helmet'
import _MongoDBStore from "connect-mongodb-session"
import { ReasonPhrases, StatusCodes, getReasonPhrase } from "http-status-codes"
import router from "./routes.js"
import { sendReport } from "../bot/bot.js"

const MongoDBStore = _MongoDBStore(session)
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static("server/public"))
app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "cdn.discordapp.com"],
    },
  })
)
app.set("view engine", "pug")


app.use(
  session({
    secret: env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // неделя
      httpOnly: true,
    },
    store: new MongoDBStore({
      uri: env.CONNECTION_STRING,
      collection: "mySessions",
    }),
    resave: false,
    saveUninitialized: false,
  })
)

// Создание csrf-токена для новой сессии
app.use((req, res, next) => {
  if (!req.session.created) {
    req.session.created = true
    req.session.csrfToken = uuid()
  }
  next()
})

// Вызов роутера
app.use(router)

// 404
app.use((req, res, next) => {
  const err = new Error("Тут ничего нет((")
  err.statusCode = StatusCodes.NOT_FOUND
  next(err)
})

// Обработчик ошибок
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  req.body = null
  const renderOptions = {}
  renderOptions.authorized = !!req.session.authorized
  renderOptions.username = req.session.username
  if (err.statusCode) {
    res.status(err.statusCode)
    res.send(
      pug.renderFile("server/views/err.pug", {
        ...renderOptions,
        code: err.statusCode,
        text: err.message ? err.message : getReasonPhrase(err.statusCode),
      })
    )
  } else {
    res.status(500)

    // При разработке выводить ошибку в консоль, а в проде отсылать репорт
    if(env.NODE_ENV === 'development') console.error(err)
    else sendReport(`${req.method}: ${req.url}
    username: ${req.session.username}
    authorized: ${req.session.authorized}
    ${err.stack}
    `)
    res.send(
      pug.renderFile("server/views/err.pug", {
        ...renderOptions,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        text: ReasonPhrases.INTERNAL_SERVER_ERROR,
      })
    )
  }
})

export default app
