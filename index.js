import { env } from 'process'
import mongoose from 'mongoose'
import { sendReport, start } from './src/bot.js'
import { app } from './src/server/server.js'

start().catch(sendReport)
mongoose.connect(env.CONNECTION_STRING, { useUnifiedTopology: true, useNewUrlParser: true})
  .then(() => {
    if(env.NODE_ENV === 'development') console.log('Connected to db')
  })
  .catch(sendReport)

app.listen(env.PORT)

