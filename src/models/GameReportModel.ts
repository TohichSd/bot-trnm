import { getModelForClass, prop } from '@typegoose/typegoose'

export class GameReport {
    @prop({ required: true })
    public author: string

    @prop({ required: true })
    public winner: string

    @prop({ required: true })
    public members: string[]

    @prop({ required: true })
    public message_id: string

    @prop({ required: true })
    public datetimeMs: number
}

export const GameReportModel = getModelForClass(GameReport, {
    schemaOptions: { collection: 'game_reports' },
})