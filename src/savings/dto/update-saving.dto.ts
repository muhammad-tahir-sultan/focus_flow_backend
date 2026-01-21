import { IsEnum, IsOptional, IsNumber, IsString, IsArray, IsDateString } from 'class-validator';
import { SavingGoalType, SavingStatus } from '../schemas/saving.schema';

export class UpdateSavingDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    targetAmount?: number;

    @IsOptional()
    @IsNumber()
    currentAmount?: number;

    @IsOptional()
    @IsEnum(SavingGoalType)
    goalType?: SavingGoalType;

    @IsOptional()
    @IsDateString()
    targetDate?: string;

    @IsOptional()
    @IsEnum(SavingStatus)
    status?: SavingStatus;

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
