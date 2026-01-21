import { IsEnum, IsOptional, IsNumber, IsString, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ExpenseCategory, PaymentMethod } from '../schemas/expense.schema';

export class UpdateExpenseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsEnum(ExpenseCategory)
    category?: ExpenseCategory;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @IsOptional()
    @IsDateString()
    date?: string;

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
