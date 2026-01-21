import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { IncomeCategory, IncomeSource } from '../schemas/income.schema';

export class CreateIncomeDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsEnum(IncomeCategory)
    category: IncomeCategory;

    @IsNotEmpty()
    @IsEnum(IncomeSource)
    source: IncomeSource;

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
