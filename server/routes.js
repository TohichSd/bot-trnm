import express from 'express'
import fetch from 'node-fetch'
import {env} from 'process'
import fs from "fs";

const router = express.Router()
let values;
fs.readFile("server/config/values.json", (err, data) => values = JSON.parse(data.toString()))

const isAuthorized = (req, res, next) => {
    if (req.session.authorized !== 'true') {
        res.redirect(env.D_AUTH_URL)
    } else next()
}

// Для тестирования работы сервера
router.get('/ping', (req, res) => {
    res.json({status: 'pass'})
})

router.get('/auth', async (req, res, next) => {
    if (req.session.authorized === 'true') {
        res.redirect('/')
        return
    }


    // Данные для получения информации о пользователе из Discord
    const data = {
        client_id: env.D_CLIENT_ID,
        client_secret: env.D_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: req.protocol + '://' + req.get('host') + req.route.path,
        code: req.query.code,
        scopes: 'identify%20guilds'
    }


    // Данные для получения информации о пользователе
    let access_data;
    await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
        .then(_access_data => _access_data.json())
        .then(_access_data => access_data = _access_data)


    // Информация о пользователе
    let userData;
    await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${access_data["token_type"]} ${access_data["access_token"]}`,
        },
    })
        .then(_userData => _userData.json())
        .then(_userData => userData = _userData)



    if (userData !== undefined) {
        req.session.authorizes = true
        res.send(userData)
    }

})

export default router