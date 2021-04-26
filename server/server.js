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
import session from "express-session"
import bodyParser from "body-parser"
import pug from "pug"
import _MongoDBStore from "connect-mongodb-session"
import { ReasonPhrases, StatusCodes, getReasonPhrase } from "http-status-codes"
import router from "./routes.js"
import { sendReport } from "../bot/bot.js"

const MongoDBStore = _MongoDBStore(session)
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set("view engine", "pug")
app.use(express.static("server/public"))

app.use(
  session({
    secret: env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: new MongoDBStore({
      uri: env.CONNECTION_STRING,
      collection: "mySessions",
    }),
    resave: false,
    saveUninitialized: false,
  })
)

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
    sendReport(`${req.method}: ${req.url}
    ${req.session.username}
    ${req.session.authorized}
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
