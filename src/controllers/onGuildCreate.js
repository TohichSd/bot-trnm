import { GuildModel } from '../db/dbModels.js'

export default async guild => {
  new GuildModel({
    guild_id: guild.id
  }).save()
}