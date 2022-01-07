import mongoose from 'mongoose'
import cachegoose from 'cachegoose'
import applicationSchema from './ApplicationSchema.js'
import clanSchema from './ClanSchema.js'
import clanWarSchema from './ClanWarSchema.js'
import eventSchema from './EventSchema.js'
import guildSchema from './GuildSchema.js'
import memberSchema from './MemberSchema.js'
import gameReportSchema from "./gameReportSchema.js";

cachegoose(mongoose)

export const ApplicationModel = mongoose.model('Application', applicationSchema)
export const ClanModel = mongoose.model('Clan', clanSchema)
export const ClanWarModel = mongoose.model('ClanWar', clanWarSchema)
export const EventModel = mongoose.model('Event', eventSchema)
export const GuildModel = mongoose.model('Guild', guildSchema)
export const MemberModel = mongoose.model('Member', memberSchema)
export const GameReportModel = mongoose.model('GameReport', gameReportSchema)