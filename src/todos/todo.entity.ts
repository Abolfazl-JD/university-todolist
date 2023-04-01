import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractSchema } from '../common/abstract.schema'
import { User } from 'src/users/user.entity';
import * as mongoose from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Todo extends AbstractSchema {
    /**
     * work to do
    */
    @Prop({
        required: true,
        trim: true,
        lowercase: true
    })
    task: string

    /**
     * determine if task is done or not 
    */
    @Prop({
        required: false,
        default: false
    })
    done: boolean

    /**
     *Additional information about the task 
    */
    @Prop({
        required: false,
        default: '',
        trim: true,
        lowercase: true
    })
    description: string

    /**
     *who owns the user 
    */
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    owner : User
}

export const TodoSchema = SchemaFactory.createForClass(Todo)