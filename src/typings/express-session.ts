import 'express-session'

declare module 'express-session' {
    interface SessionData {
        member_id: string
        username: string
        csrfToken: string
        lastGuild: string
        lastSubmitID: string
    }
}