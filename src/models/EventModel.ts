import { DocumentType, getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose'
import { Member } from './MemberModel'

class Event {
    @prop({ required: true })
    public guild_id!: string

    @prop({ required: true })
    public message_id!: string

    @prop({ required: true })
    public name!: string

    @prop({ required: true })
    public description!: string

    @prop()
    public loot: string

    @prop({ required: true })
    public datetimeMs!: number

    @prop({ required: true })
    public imageUrl!: string

    @prop({ ref: () => Member })
    public members: Member[]

    @prop()
    public isOver: boolean

    public static async getEventByMessageID(
        this: ReturnModelType<typeof Event>,
        messageID: string
    ): Promise<DocumentType<Event>> {
        return this.findOne({
            message_id: messageID,
            datetimeMs: { $gt: Date.now().valueOf() - 8 * 60 * 60 * 1000 },
        }).exec()
    }

    public static async getAllGuildEvents(
        this: ReturnModelType<typeof Event>,
        guild_id: string
    ): Promise<DocumentType<Event>[]> {
        return this.find({ guild_id }).sort({ datetimeMs: -1 }).exec()
    }

    public static async getOldGuildEvents(
        this: ReturnModelType<typeof Event>,
        guild_id: string
    ): Promise<DocumentType<Event>[]> {
        return this.find({
            guild_id,
            isOver: { $ne: false },
        })
            .sort({ datetimeMs: -1 })
            .exec()
    }

    public static async getNewGuildEvents(
        this: ReturnModelType<typeof Event>,
        guild_id: string
    ): Promise<DocumentType<Event>[]> {
        return this.find({
            guild_id,
            isOver: { $ne: true },
        })
            .sort({ datetimeMs: 1 })
            .exec()
    }
}

const EventModel = getModelForClass(Event)

export { EventModel, Event }
