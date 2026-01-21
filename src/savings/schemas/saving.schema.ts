import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type SavingDocument = Saving & Document;

export enum SavingGoalType {
    EMERGENCY_FUND = 'Emergency Fund',
    RETIREMENT = 'Retirement',
    INVESTMENT = 'Investment',
    EDUCATION = 'Education',
    HOUSE = 'House/Property',
    VEHICLE = 'Vehicle',
    VACATION = 'Vacation',
    WEDDING = 'Wedding',
    BUSINESS = 'Business',
    OTHER = 'Other',
}

export enum SavingStatus {
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    PAUSED = 'Paused',
}

@Schema({ timestamps: true })
export class Saving {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    targetAmount: number;

    @Prop({ required: true, default: 0 })
    currentAmount: number;

    @Prop({ required: true, enum: SavingGoalType })
    goalType: string;

    @Prop({ required: true })
    targetDate: Date;

    @Prop({ required: true, enum: SavingStatus, default: SavingStatus.IN_PROGRESS })
    status: string;

    @Prop()
    description?: string;

    @Prop({ default: 0 })
    monthlyContribution?: number;

    @Prop()
    tags?: string[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;
}

export const SavingSchema = SchemaFactory.createForClass(Saving);
