import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ExpenseCategory, PaymentMethod } from '../schemas/expense.schema';

export class CreateExpenseDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsEnum(ExpenseCategory)
    category: ExpenseCategory;

    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isRecurring?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
