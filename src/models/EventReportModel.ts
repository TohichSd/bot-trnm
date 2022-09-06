import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { collection: 'event_reports' } })
export class EventReport {
    @prop({ required: true })
    public guild_id: string

    @prop({ required: true })
    public message_id: string

    @prop({ required: true })
    public moderator: string

    @prop({ required: true})
    public members: string[]

    @prop({ required: true })
    public winner: string
    
    @prop({ required: true })
    public points: number[]
    
    @prop()
    public is_accepted: boolean

    @prop({ required: true, ref: () => Event })
    public event: Ref<Event>
}

export const EventReportModel = getModelForClass(EventReport)
