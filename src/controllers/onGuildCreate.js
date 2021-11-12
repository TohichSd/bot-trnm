import { GuildModel } from '../db/models.js'

export default async guild => {
  new GuildModel({
    guild_id: guild.id
  }).save()
}