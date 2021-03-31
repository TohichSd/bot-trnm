import express from 'express'
import pug from 'pug'
import fetch from 'node-fetch'
import {env} from 'process'
import values from './config/values.config.js'
import {isMemberAdmin} from "../bot/bot.js"

const router = express.Router()
const renderParams = {}



// Для тестирования работы сервера
router.get('/ping', (req, res) => {
    res.json({status: 'pass'})
})

// Авторизация пользовательля с помощью Discord OAuth2
router.get('/auth',
    /**
     * @param {Object} req
     * @param {Object} res
     * @param req.protocol
     * @param req.get
     * @param req.route
     * @param req.query
     * @param req.session сессия
     */
    async (req, res) => {

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
    /**
     * @param {string} accessData.token_type
     * @param {string} accessData.access_token
     */
    let accessData = {}
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
    let userData = {}
    await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${accessData.token_type} ${accessData.access_token}`,
        },
    })
        .then(_userData => {userData = _userData})


    if (userData.status !== 200) {
        req.session.authorized = false
        res.status(401)
        res.send(pug.renderFile('server/views/err.pug', {code: 401, text:values.error["401-ds"]}))
    }
    else {
        userData = await userData.json()
        req.session.authorized = true
        req.session.username = `${userData.username}#${userData.discriminator}`
        req.session.userID = userData.id
        res.redirect('/')
    }
})

router.use(
    /**
     * @param req.session сессия
     */
    (req, res, next) => {
    // Обновление параметров рендера
    renderParams.authorized = !!req.session.authorized
    renderParams.username = req.session.username
    next()
})

// Страница авторизации
router.get("/ds-auth", ((req, res) => {
    res.send(pug.renderFile("server/views/ds-auth.pug", {auth_link: env.D_AUTH_URL}))
}))

// Далее находятся защищённые страницы

const checkAuth = (req, res, next) => {
    if (req.session.authorized !== true){
        res.redirect("/ds-auth")
        return
    }
    if(!isMemberAdmin(req.session.userID)) {
        res.status(403)
        res.send(pug.renderFile('server/views/err.pug', {code: 403, text: values.error[403], ...renderParams}))
        return
    }
    next()
}

// Главная страница
router.get('/', checkAuth, (req, res) => {
    res.send(pug.renderFile('server/views/main.pug', renderParams))
})

router.get('/logout', (req, res) => {
    req.session = null
    res.redirect('/ds-auth')
})

export default router