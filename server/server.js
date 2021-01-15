/**
 * @module server
 */

import express from "express"
import DAO from "../modules/db/index.js"
import winston_logger from "../modules/logger/index.js"
import dfname from "../utils/__dfname.js"
import pug from "pug"
import path from "path"
import bodyParser from "body-parser"
import Tournament from "../bot/helpers/tournament.js"
import moment from "moment"
import {env} from "process"
import sessions from "client-sessions"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))
const app = express()
const port = 8709
const __dirname = dfname.__dirname(import.meta.url)
let renderObject = {}
moment.locale("ru")

export default async (client) => {
    const guild = client.guilds.cache.get("663333255855996929")
    app.set('view engine', 'pug')
    app.use(express.static(path.join(__dirname, "/public")))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: false}))

    app.set('trust proxy', 1)

    app.use(
        sessions({
            cookieName: 'session',
            secret: env.SESSION_SECRET,
            duration: 12 * 60 * 60 * 1000,
        })
    )

    app.use((req, res, next) => {
        renderObject.username = "Username"
        renderObject.authorised = true
        next()
    })

    app.get("/", (req, res) => {
        const compiled = pug.renderFile(path.join(__dirname, "/views/main.pug"), renderObject)
        res.status(200).send(compiled)
    })

    app.get("/new", (req, res) => {
        const compiled = pug.renderFile(path.join(__dirname, "/views/new.pug"), renderObject)
        res.status(200).send(compiled)
    })

    app.post("/new", (req, res) => {
        res.status(200).send(pug.renderFile(path.join(__dirname, "/views/new.pug"), renderObject))
        new Tournament({
            name: req.body.name,
            description: req.body.description,
            loot: req.body.awards,
            date: moment(req.body.datetime).format('LLL'),
            datetimeMs: new Date(req.body.datetime).getTime(),
            guild: guild
        })
    })

    app.use((req, res) => {
        if (req.method === "GET") {
            const compiled = pug.renderFile(path.join(__dirname, "views/e404.pug"), {
                authorised: true
            })
            res.status(404).send(compiled)
        } else {
            res.status(404).end()
        }
    })

    app.listen(port, () => {
        logger.info("Server is listening on port " + port)
    })
}