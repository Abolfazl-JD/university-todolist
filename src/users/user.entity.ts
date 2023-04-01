import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ApiHideProperty } from "@nestjs/swagger"
import { AbstractSchema } from "src/common/abstract.schema"

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractSchema {
    @Prop({
        required: true,
        trim: true
    })
    username: string

    @Prop({
        required: true,
        trim: true,
        unique: true
    })
    email: string

    @Prop({
        required: true,
        trim: true
    })
    password: string
    
    @ApiHideProperty()
    @Prop({
        required: false,
        default: '',
    })
    hashedRefreshToken: string

    /**
     *determine if email is confirmed 
    */
    @Prop({
        required: false,
        default: false
    })
    emailIsConfirmed: boolean

    /**
     * path to profile image
    */
    @Prop({
        required: false,
        default: ''
    })
    imagePath: string
}

export const UserSchema = SchemaFactory.createForClass(User)