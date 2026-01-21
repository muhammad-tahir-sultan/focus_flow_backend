import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { SavingGoalType } from '../schemas/saving.schema';

export class CreateSavingDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsNumber()
    targetAmount: number;

    @IsOptional()
    @IsNumber()
    currentAmount?: number;

    @IsNotEmpty()
    @IsEnum(SavingGoalType)
    goalType: SavingGoalType;

    @IsNotEmpty()
    @IsDateString()
    targetDate: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    monthlyContribution?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
