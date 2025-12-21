import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type GoalDocument = Goal & Document;

export enum GoalCategory {
    CAREER = 'Career',
    HEALTH = 'Health',
    FINANCE = 'Finance',
    SKILLS = 'Skills',
    PERSONAL = 'Personal',
}

export enum GoalHorizon {
    DAILY = 'Daily',
    THIRTY_DAYS = '30 Days',
    THREE_MONTHS = '3 Months',
    SIX_MONTHS = '6 Months',
    ONE_YEAR = '1 Year',
    TWO_YEARS = '2 Years',
    THREE_YEARS = '3 Years',
    FIVE_YEARS = '5 Years',
}

export enum GoalStatus {
    ACTIVE = 'Active',
    COMPLETED = 'Completed',
    DROPPED = 'Dropped',
}

@Schema({ timestamps: true })
export class Goal {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, enum: GoalCategory })
    category: string;

    @Prop({ required: true, enum: GoalHorizon })
    horizon: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ required: true, enum: GoalStatus, default: GoalStatus.ACTIVE })
    status: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
