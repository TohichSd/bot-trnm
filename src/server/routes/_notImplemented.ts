import { Router } from 'express'

const router = Router()
router.get('/:guild_id/controls', async (req, res) => {
    res.render('_notImplemented')
})

export default router