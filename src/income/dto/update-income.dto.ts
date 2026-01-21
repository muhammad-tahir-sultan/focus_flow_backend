import { IsEnum, IsOptional, IsNumber, IsString, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { IncomeCategory, IncomeSource } from '../schemas/income.schema';

export class UpdateIncomeDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsEnum(IncomeCategory)
    category?: IncomeCategory;

    @IsOptional()
    @IsEnum(IncomeSource)
    source?: IncomeSource;

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
