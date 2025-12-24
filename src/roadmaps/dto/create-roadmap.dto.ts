import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoadmapDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    weeklyMilestones?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    resources?: string[];

    @IsOptional()
    @IsString()
    difficulty?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
