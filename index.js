import app from "./server/server.js"
import {env} from 'process'

app.listen(env.PORT)