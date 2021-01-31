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
const port = env.PORT
const __dirname = dfname.__dirname(import.meta.url)
let renderObject = {}
let guild
let trnmDone = false
moment.locale("ru")

export default async (client) => {
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

    // app.use((req, res, next) => {
    //     renderObject.username = "Username"
    //     renderObject.authorized = true
    //     next()
    // })

    app.use((req, res, next) => {
        if (req.session.authorized !== true && req.url !== "/login") {
            res.redirect("/login")
            return
        }
        guild = client.guilds.cache.find(g => g.id === req.session.guild_id)
        if (req.session.authorized) renderObject.authorized = true
        else renderObject.authorized = false
        if (req.session.guild_id && req.session.id)
            guild.members.fetch(req.session.id)
                .then(member => {
                    renderObject.username = member.user.tag
                    next()
                })
        else
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
        if (!req.body.name || !req.body.description || !req.body.awards || !req.body.datetime) {
            renderObject.notAllFilled = true
            const compiled = pug.renderFile(path.join(__dirname, "/views/new.pug"), renderObject)
            res.status(200).send(compiled)
            renderObject.notAllFilled = false
            return
        }
        new Tournament({
            name: req.body.name,
            description: req.body.description,
            loot: req.body.awards,
            date: moment(req.body.datetime).format('LLL'),
            datetimeMs: new Date(req.body.datetime).getTime(),
            guild: guild
        })
            .then(()=>{
                trnmDone = true
                res.status(200).redirect("/tournament-done")
            })
            .catch(err => {
                renderObject.text = err
                res.status(400).redirect("/tournament-err")
            })
    })

    app.get('/tournament-done', (req, res) => {
        if (!trnmDone) {
            res.redirect("/")
            return
        }
        res.status(200).send(pug.renderFile(path.join(__dirname, "/views/tournament-done.pug"), renderObject))
        trnmDone = false
    })

    app.get('/tournament-err', (req, res) => {
        if (!trnmDone) {
            res.redirect("/")
            return
        }
        res.status(200).send(pug.renderFile(path.join(__dirname, "/views/tournament-done.pug"), renderObject))
        renderObject.text = undefined
        trnmDone = false
    })

    app.get("/login", (req, res) => {
        if (req.query["logout"] && req.session.authorized) {
            req.session.guild_id = undefined
            req.session.id = undefined
            req.session.authorized = false
            renderObject.authorized = false
            renderObject.username = ""
        }
        const compiled = pug.renderFile(path.join(__dirname, "/views/login.pug"), renderObject)
        res.status(200).send(compiled)
    })

    app.post('/login', (req, res) => {
        req.session.guild_id = undefined
        req.session.id = undefined
        req.session.authorized = false
        if (!req.body.token) {
            renderObject.notFilled = true
            const compiled = pug.renderFile(path.join(__dirname, "/views/login.pug"), renderObject)
            res.status(400).send(compiled)
            renderObject.notFilled = false
            return
        }
        DAO.get("SELECT * FROM roles WHERE token = $token", {
            $token: req.body.token
        }).then((row) => {
            if (row === undefined) {
                renderObject.badToken = true
                const compiled = pug.renderFile(path.join(__dirname, "/views/login.pug"), renderObject)
                res.status(400).send(compiled)
                renderObject.badToken = false
                return
            }
            req.session.guild_id = row["guild_id"]
            req.session.id = row["id"]
            req.session.authorized = true
            res.redirect('/')
        })
    })

    app.use((req, res) => {
        if (req.method === "GET") {
            const compiled = pug.renderFile(path.join(__dirname, "views/e404.pug"), renderObject)
            res.status(404).send(compiled)
        } else {
            res.status(404).end()
        }
    })


    app.listen(port, () => {
        logger.info("Server is listening on port " + port)
    })
}