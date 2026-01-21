import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { LoanType } from '../schemas/loan.schema';

export class CreateLoanDto {
    @IsString()
    title: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    paidAmount?: number;

    @IsEnum(LoanType)
    type: LoanType;

    @IsString()
    partyName: string;

    @IsDateString()
    date: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    interestRate?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    tags?: string[];
}
