import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRoadmapDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

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
