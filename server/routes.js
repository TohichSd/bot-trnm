import express from 'express'
import pug from 'pug'
import fetch from 'node-fetch'
import {env} from 'process'

/*
import fs from "fs";
let values;
fs.readFile("server/config/values.json", (err, data) => values = JSON.parse(data.toString()))
*/

const router = express.Router()

const isAuthorized = (req, res, next) => {
    if (req.session.authorized !== true) {
        res.redirect("/ds-auth")
    } else next()
}


// Для тестирования работы сервера
router.get('/ping', (req, res) => {
    res.json({status: 'pass'})
})


/**
 * Авторизация пользовательля с помощью Discord OAuth2
*/
router.get('/auth', async (req, res) => {
    if (req.session.authorized === true) {
        res.redirect('/')
        return
    }

    // Данные для получения информации о пользователе из Discord
    const data = {
        client_id: env.D_CLIENT_ID,
        client_secret: env.D_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}${req.route.path}`,
        code: req.query.code,
        scopes: 'identify%20guilds'
    }

    // Данные для получения информации о пользователе
    let accessData;
    await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
        .then(_accessData => _accessData.json())
        .then(_accessData => {accessData = _accessData})

    // Информация о пользователе
    let userData;
    await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${accessData.token_type} ${accessData.access_token}`,
        },
    })
        .then(_userData => {userData = _userData})


    if (userData.status !== 200) {
        req.session.authorized = false
        res.status(401)
        res.send(pug.renderFile('server/views/err.pug', {code: 401, text: "Произошла ошибка!"}))
    }
    else {
        req.session.authorized = true
        res.redirect('/')
    }

})

// Страница авторизации
router.get("/ds-auth", ((req, res) => {
    res.send(pug.renderFile("server/views/ds-auth.pug", {auth_link: env.D_AUTH_URL}))
}))

router.use(((req, res, next) => isAuthorized(req, res, next)))

export default router