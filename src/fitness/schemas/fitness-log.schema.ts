import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FitnessLogDocument = FitnessLog & Document;

@Schema({ timestamps: true })
export class FitnessLog {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: string; // Storing as YYYY-MM-DD string to ensure one per day easily

    @Prop({ default: false })
    workoutCompleted: boolean;

    @Prop({ default: false })
    runCompleted: boolean;

    @Prop({ default: false })
    waterIntake: boolean;

    @Prop({ default: false })
    sleepQuality: boolean;

    @Prop({ default: false })
    stretchDone: boolean;
}

export const FitnessLogSchema = SchemaFactory.createForClass(FitnessLog);
FitnessLogSchema.index({ userId: 1, date: -1 }, { unique: true });
