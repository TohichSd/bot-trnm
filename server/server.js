import express from 'express'
import {env} from 'process'
import {pool} from '../db/commondb.js'
import session from 'express-session'
import _pgSession from 'connect-pg-simple'
import bodyParser from 'body-parser'
import pug from 'pug'
import fs from 'fs'
import router from "./routes.js";

const pgSession = _pgSession(session)

const app = express()
let values;
fs.readFile("server/config/values.json", (err, data) => values = JSON.parse(data.toString()))

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set("view engine", "pug")
app.use(express.static("server/public"))
app.use(session({
    store: new pgSession({
        pool: pool
    }),
    name: "session",
    secret: env.SESSION_SECRET,
    resave: false,
    cookie: {
        sameSite: 'Lax',
        maxAge: 10 * 24 * 60 * 60 * 1000,
        secure: false
    },
    saveUninitialized: true
}))

app.use(router)

// 404
app.use((req, res, next) => {
    const err = new Error(values.error[404])
    err.status = 404
    const compiledPage = pug.renderFile("server/views/err.pug", {code: err.status, text: err.message})
    res.status(err.status)
    res.send(compiledPage)
})

export default app