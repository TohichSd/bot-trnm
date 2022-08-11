import { getModelForClass, prop, ReturnModelType, DocumentType } from '@typegoose/typegoose'


export class AccessToken {
    @prop({ required: true })
    public token: string

    @prop({ required: true })
    public member_id: string

    @prop({ required: true })
    public created_at: number
    
    @prop()
    public disabled: boolean

    public static async findOneByToken(
        this: ReturnModelType<typeof AccessToken>,
        token: string
    ): Promise<DocumentType<AccessToken>> {
        return this.findOne({
            token,
            created_at: { $lt: Date.now().valueOf() + 24 * 60 * 60 * 1000 },
            disabled: { $ne: true }
        }).exec()
    }
}

export const AccessTokenModel = getModelForClass(AccessToken, {
    schemaOptions: { collection: 'access_tokens' },
})
