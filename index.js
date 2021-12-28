import { env } from 'process'
import mongoose from 'mongoose'
// import dotenv from 'dotenv'
import * as https from 'https'
import { readFileSync } from 'fs'
import { sendReport, start } from './src/bot.js'
import { app } from './src/server/server.js'

// dotenv.config()
start().catch(console.error)
mongoose
  .connect(env.CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    if (env.NODE_ENV === 'development') console.log('Connected to db')
  })
  .catch(sendReport)

if (env.SSL_CERT_PATH && env.SSL_KEY_PATH) {
  https.createServer({
    key: readFileSync(env.SSL_CERT_PATH),
    cert: readFileSync(env.SSL_KEY_PATH),
  }, 443)
}
else {
  app.listen(env.PORT)
}