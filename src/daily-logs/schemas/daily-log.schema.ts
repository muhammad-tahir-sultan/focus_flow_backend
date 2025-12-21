import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type DailyLogDocument = DailyLog & Document;

@Schema({ timestamps: true })
export class DailyLog {
    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    timeSpent: number;

    @Prop({ required: true })
    reflection: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;
}

export const DailyLogSchema = SchemaFactory.createForClass(DailyLog);
