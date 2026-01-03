import { IsString, IsNotEmpty, IsDateString, IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateSkillDto {
    @IsString()
    @IsNotEmpty()
    skillName: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    duration: string;

    @IsEnum(['Technical', 'Soft Skill', 'Language', 'Other'])
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    notes: string;

    @IsNumber()
    @Min(1)
    @Max(10)
    masteryLevel: number;
}
