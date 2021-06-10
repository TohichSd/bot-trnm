import { isMemberAdmin } from '../../bot.js'

const onlyAuth = (req, res, next) => {
  if (req.session.auth !== true) {
    res.redirect('/ds-auth')
    return
  }
  next()
}

const onlyUnauthorized = (req, res, next) => {
  if (req.session.auth === true) {
    res.redirect('/')
    return
  }
  next()
}

const onlyGuildAdmin = (req, res, next) => {
  isMemberAdmin(req.session.userID, req.params.id)
    .then(result => {
      if (result) next()
      else res.redirect('/ds-auth')
    })
    .catch(err => {
      next(err)
    })
}

export {onlyAuth, onlyGuildAdmin, onlyUnauthorized}