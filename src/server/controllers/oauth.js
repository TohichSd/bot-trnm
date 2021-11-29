import { env } from 'process'
import fetch from 'node-fetch'

const Oauth = async (req, res, next) => {
  // Данные для получения информации о пользователе из Discord
  const data = {
    client_id: env.D_CLIENT_ID,
    client_secret: env.D_CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: env.NODE_ENV === 'development' ? `http://${req.get('host')}${req.route.path}` : `https://arm-bot.openode.dev/auth`,
    code: req.query.code,
    scopes: 'identify%20guilds',
  }

  // Данные для получения информации о пользователе
  const accessData = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams(data),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(_accessData => _accessData.json())

  // Информация о пользователе
  let userData = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${accessData.token_type} ${accessData.access_token}`,
    },
  })

  if (userData.status !== 200) {
    req.session.auth = false
    next(new Error('User data response status is not 200'))
  } else {
    userData = await userData.json()
    req.session.auth = true
    req.session.username = `${userData.username}#${userData.discriminator}`
    req.session.userID = userData.id
    res.redirect('/')
  }
}

export default Oauth
