import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as https from 'https'
import helmet from 'helmet'
import { join } from 'path'
import { readdir } from 'fs/promises'
import { env } from 'process'
import * as session from 'express-session'
import { HTTPError } from '../classes/CommandErrors'
import { StatusCodes } from 'http-status-codes'
import Logger from '../classes/Logger'
import MongoStore = require('connect-mongo')

export default class Server {
    private static instance: Server
    private app: express.Express

    private constructor() {
        this.app = express()
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(express.static(join(__dirname, 'public')))
        this.app.set('view engine', 'pug')
        this.app.set('views', join(__dirname, 'views'))

        this.app.use(
            session({
                secret: env.SESSION_SECRET,
                cookie: {
                    maxAge: 1000 * 60 * 60 * 24 * 7, // неделя
                    httpOnly: true,
                },
                store: MongoStore.create({
                    mongoUrl: env.CONNECTION_STRING,
                    dbName: 'botdata-test',
                }),
                resave: false,
                saveUninitialized: false,
            })
        )

        this.app.use(
            helmet.contentSecurityPolicy({
                useDefaults: true,
                directives: {
                    'default-src': "'self'",
                    'img-src': ["'self'", 'cdn.discordapp.com', 'media.discordapp.com'],
                    'upgrade-insecure-requests': null,
                },
            })
        )
        this.app.use(helmet.dnsPrefetchControl())
        this.app.use(helmet.expectCt())
        this.app.use(helmet.frameguard())
        this.app.use(helmet.hidePoweredBy())
        this.app.use(helmet.ieNoOpen())
        this.app.use(helmet.noSniff())
        this.app.use(helmet.permittedCrossDomainPolicies())
        this.app.use(helmet.referrerPolicy())
        this.app.use(helmet.xssFilter())
    }

    public static getInstance(): Server {
        if (!Server.instance) Server.instance = new Server()
        return Server.instance
    }

    public startHTTP(port: number): void {
        this.app.listen(port)
    }

    public startHTTPS(port: number, sslKey: string, sslCert: string): void {
        https
            .createServer(
                {
                    key: sslKey,
                    cert: sslCert,
                },
                this.app
            )
            .listen(port)
    }

    public async loadRoutes(path: string): Promise<void> {
        const files = await readdir(path)
        try {
            await Promise.all(
                files.map(async file => {
                    const router = await import(`${path}/${file}`)
                    if (router.default) this.app.use(router.default)
                    else throw new Error('Invalid router file default export type (' + file + ')')
                })
            )
        } catch (e) {
            Logger.error(e)
        }

        // 404
        this.app.use((req, res, next) => {
            next(new HTTPError(StatusCodes.NOT_FOUND, 'Страница не найдена'))
        })

        // error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.use((err, req, res, next) => {
            res.set({ 'content-type': 'text/html; charset=utf-8' })
            res.status(err.code)
            if (err.errorType == 'HTTPError')
                res.render('error', {
                    errorTitle: err.title || err.code.toString(),
                    errorDescription: err.response,
                })
            else if (err.errorType == 'APIError') res.json({ error: err })
            else Logger.error(err)
        })
    }
}
