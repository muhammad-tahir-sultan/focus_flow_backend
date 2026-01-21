import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type IncomeDocument = Income & Document;

export enum IncomeCategory {
    SALARY = 'Salary',
    FREELANCE = 'Freelance',
    BUSINESS = 'Business',
    INVESTMENT = 'Investment Returns',
    RENTAL = 'Rental Income',
    BONUS = 'Bonus',
    GIFT = 'Gift',
    REFUND = 'Refund',
    OTHER = 'Other',
}

export enum IncomeSource {
    PRIMARY_JOB = 'Primary Job',
    SIDE_HUSTLE = 'Side Hustle',
    PASSIVE = 'Passive Income',
    ONE_TIME = 'One-time',
}

@Schema({ timestamps: true })
export class Income {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true, enum: IncomeCategory })
    category: string;

    @Prop({ required: true, enum: IncomeSource })
    source: string;

    @Prop({ required: true })
    date: Date;

    @Prop()
    description?: string;

    @Prop({ default: false })
    isRecurring: boolean;

    @Prop()
    tags?: string[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);
