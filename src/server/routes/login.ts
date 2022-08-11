import { Router } from 'express'
import { AccessTokenModel } from '../../models/AccessTokenModel'
import { HTTPError } from '../../classes/CommandErrors'
import Bot from '../../discord/Bot'

const router = Router()

router.get('/login', async (req, res, next) => {
    if (!req.query.token) {
        res.render('login')
        return
    }
    const token: string = req.query.token as string
    const accessToken = await AccessTokenModel.findOneByToken(token)
    if (!accessToken) {
        next(
            new HTTPError(
                403,
                'Данная ссылка для входа не существует или устарела. Используйте команду !войти для получения новой.',
                'Ошибка: токен не существует.'
            )
        )
        return
    }
    const user = await Bot.getInstance().getUserByID(accessToken.member_id)
    req.session.username = user.tag
    req.session.member_id = accessToken.member_id
    res.redirect('/?reset=1')
})

router.get('/logout', async (req, res) => {
    req.session.member_id = undefined
    req.session.username = undefined
    res.redirect('/')
})

export default router
