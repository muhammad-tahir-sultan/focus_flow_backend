import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EbayTaskLogDocument = HydratedDocument<EbayTaskLog>;

@Schema({ timestamps: true })
export class EbayTaskLog {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: Date;

    @Prop({ type: [String], default: [] })
    focusAreas: string[];

    @Prop({ type: [String], default: [] })
    tasksCompleted: string[];

    @Prop({ required: true, default: 0 })
    timeSpentMinutes: number;

    @Prop({ default: '' })
    winOfTheDay: string;

    @Prop({ default: '' })
    blockerOrLesson: string;
}

export const EbayTaskLogSchema = SchemaFactory.createForClass(EbayTaskLog);
