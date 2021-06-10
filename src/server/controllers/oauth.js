import { env } from 'process'
import fetch from "node-fetch"

const Oauth = async (req, res, next) => {
  // Данные для получения информации о пользователе из Discord
  const data = {
    client_id: env.D_CLIENT_ID,
    client_secret: env.D_CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: `${req.protocol}://${req.get("host")}${req.route.path}`,
    code: req.query.code,
    scopes: "identify%20guilds",
  }

  // Данные для получения информации о пользователе
  let accessData = {}
  await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams(data),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((_accessData) => _accessData.json())
    .then((_accessData) => {
      accessData = _accessData
    })

  // Информация о пользователе
  let userData = {}
  await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${accessData.token_type} ${accessData.access_token}`,
    },
  }).then((_userData) => {
    userData = _userData
  })

  if (userData.status !== 200) {
    req.session.auth = false
    next(403)
  } else {
    userData = await userData.json()
    req.session.auth = true
    req.session.username = `${userData.username}#${userData.discriminator}`
    req.session.userID = userData.id
    res.redirect("/")
  }
}

export default Oauth