import { env } from "process"
import { start } from "./bot/bot.js"
import app from "./server/server.js"

start().catch((err) => console.error(err))

app.listen(env.PORT)
