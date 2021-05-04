import { env } from "process"
import { start } from "./src/bot.js"
import app from "./src/server/server.js"

start().catch((err) => console.error(err))

app.listen(env.PORT)
