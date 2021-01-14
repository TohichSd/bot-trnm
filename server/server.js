/**
 * @module server
 */

import express from "express"
import DAO from "../modules/db/index.js"
import winston_logger from "../modules/logger/index.js"
import dfname from "../utils/__dfname.js"
import pug from "pug"
import path from "path"

const logger = new winston_logger(dfname.dirfilename(import.meta.url))
const app = express()
const port = 8709
const __dirname = dfname.__dirname(import.meta.url)

let renderObject = {}

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, "/public")))

app.use((req,res,next) => {
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

app.use((req,res) => {
    const compiled = pug.renderFile(path.join(__dirname,"views/e404.pug"), {
        authorised: true
    })
    res.status(404).send(compiled)
})

app.listen(port, () => {
    logger.info("Server is listening on port " + port)
})