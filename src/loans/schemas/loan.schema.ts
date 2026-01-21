import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LoanType {
    TOOK = 'Took', // Borrowed money (liability)
    GAVE = 'Gave', // Lent money (asset)
}

export enum LoanStatus {
    ACTIVE = 'Active',
    PARTIALLY_PAID = 'Partially Paid',
    FULLY_PAID = 'Fully Paid',
    DEFAULTED = 'Defaulted',
}

@Schema({ timestamps: true })
export class Loan extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    paidAmount: number;

    @Prop({ required: true, enum: LoanType })
    type: LoanType;

    @Prop({ required: true })
    partyName: string; // Person/entity you borrowed from or lent to

    @Prop({ required: true })
    date: Date;

    @Prop()
    dueDate: Date;

    @Prop({ default: 0 })
    interestRate: number; // Annual interest rate percentage

    @Prop({ enum: LoanStatus, default: LoanStatus.ACTIVE })
    status: LoanStatus;

    @Prop()
    description: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
