/**
 * @module server
 * Веб интерфейс для взаиммодействия с ботом
 */

/**
 * Переменные окружения:
 * D_CLIENT_ID - client id из Discord
 * D_CLIENT_SECRET - client secret из Discord
 */

import express from 'express'
import {env} from 'process'
import session from 'express-session'
import bodyParser from 'body-parser'
import pug from 'pug'
import _MongoDBStore from 'connect-mongodb-session'
import router from "./routes.js"
import values from './config/values.config.js'

const MongoDBStore = _MongoDBStore(session)
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set("view engine", "pug")
app.use(express.static("server/public"))

app.use(session({
    secret: env.SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: new MongoDBStore({
        uri: env.CONNECTION_STRING,
        collection: 'mySessions'
    }),
    resave: false,
    saveUninitialized: false
}))

// Вызов роутера
app.use(router)

// 404
app.use((req, res) => {
    const err = new Error(values.error[404])
    err.status = 404
    const compiledPage = pug.renderFile("server/views/err.pug", {code: err.status, text: err.message})
    res.status(err.status)
    res.send(compiledPage)
})

export default app