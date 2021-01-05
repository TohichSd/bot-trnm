import sqlite3 from "sqlite3"
import {access} from "fs"
    ;

(async () => {
    let isDbExists = false
    await access("./databases/database.db").then(error => {
        if (!error) isDbExists = true
    })
    if (isDbExists) {
        let db = new sqlite3.Database("./databases/database.db", sqlite3.OPEN_CREATE)
        db.run(`CREATE TABLE "applications" (
\t"id"\tTEXT NOT NULL,
\t"guild_id"\tTEXT NOT NULL,
\t"link"\tTEXT,
\t"level"\tTEXT,
\t"age"\tTEXT,
\t"micro"\tTEXT
)`)
        db.run(`CREATE TABLE "events" (
\t"id"\tINTEGER,
\t"name"\tTEXT NOT NULL,
\t"description"\tTEXT,
\t"loot"\tTEXT,
\t"message_id"\tTEXT,
\t"channel_id"\tTEXT,
\t"channelsToSendID"\tTEXT,
\t"feedbackChannel"\tTEXT,
\tPRIMARY KEY("id" AUTOINCREMENT)
)`)
        db.run(`CREATE TABLE "guilds" (
\t"guild_id"\tTEXT NOT NULL UNIQUE,
\t"lastEventID"\tTEXT,
\tPRIMARY KEY("guild_id")
)`)
        db.run(`CREATE TABLE "members" (
\t"id"\tTEXT NOT NULL,
\t"guild_id"\tTEXT NOT NULL,
\t"event"\tINTEGER
, "messagesID"\tTEXT)`)
        db.run(`CREATE TABLE "roles" (
\t"guild_id"\tTEXT NOT NULL,
\t"role"\tINTEGER,
\t"id"\tTEXT NOT NULL
)`)
    }
})()