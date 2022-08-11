import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose'

class Application {
    @prop()
    public age?: string

    @prop({ required: true })
    public guild_id: string

    @prop({ required: true })
    public id: string

    @prop({ required: true })
    public level: string

    @prop({ required: true })
    public link: string

    @prop({ required: true })
    public micro: string

    public static async findOneByMemberID(this: ReturnModelType<typeof Application>, id: string) {
        return this.findOne({ id }).exec()
    }
}

export default getModelForClass(Application, { schemaOptions: { collection: 'applications' } })
