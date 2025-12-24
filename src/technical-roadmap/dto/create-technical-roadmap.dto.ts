import { IsString, IsNotEmpty, IsEnum, IsArray, IsNumber, Min, Max, IsOptional, IsDateString, IsBoolean, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

class ResourceDto {
    @IsString()
    @IsNotEmpty()
    label: string;

    @IsUrl()
    @IsNotEmpty()
    url: string;

    @IsEnum(['Docs', 'Course', 'Video', 'Article', 'Book'])
    @IsNotEmpty()
    type: string;
}

export class CreateTechnicalRoadmapDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    summary: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    whyThisMatters: string;

    @IsArray()
    @IsString({ each: true })
    problemsItSolves: string[];

    @IsArray()
    @IsString({ each: true })
    tradeOffs: string[];

    @IsString()
    @IsNotEmpty()
    motivation: string;

    @IsArray()
    @IsString({ each: true })
    learningOutcomes: string[];

    @IsEnum(['Backend', 'Frontend', 'DevOps', 'System Design', 'AI'])
    category: string;

    @IsEnum(['High', 'Medium', 'Low'])
    priority: string;

    @IsEnum(['Planned', 'InProgress', 'Completed'])
    status: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    difficulty: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ResourceDto)
    resources: ResourceDto[];

    @IsOptional()
    @IsDateString()
    plannedStart?: string;

    @IsOptional()
    @IsDateString()
    plannedEnd?: string;
}
