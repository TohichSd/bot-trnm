import { env } from 'process'
import mongoose from 'mongoose'
// import dotenv from 'dotenv'
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

app.listen(env.PORT, env.SELF_URL)
