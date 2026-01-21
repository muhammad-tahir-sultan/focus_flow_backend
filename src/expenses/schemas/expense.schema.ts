import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ExpenseDocument = Expense & Document;

export enum ExpenseCategory {
    FOOD = 'Food & Dining',
    TRANSPORT = 'Transportation',
    UTILITIES = 'Utilities',
    ENTERTAINMENT = 'Entertainment',
    HEALTHCARE = 'Healthcare',
    EDUCATION = 'Education',
    SHOPPING = 'Shopping',
    HOUSING = 'Housing',
    INVESTMENT = 'Investment',
    OTHER = 'Other',
}

export enum PaymentMethod {
    CASH = 'Cash',
    CREDIT_CARD = 'Credit Card',
    DEBIT_CARD = 'Debit Card',
    UPI = 'UPI',
    NET_BANKING = 'Net Banking',
    WALLET = 'Wallet',
}

@Schema({ timestamps: true })
export class Expense {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true, enum: ExpenseCategory })
    category: string;

    @Prop({ required: true, enum: PaymentMethod })
    paymentMethod: string;

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

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
