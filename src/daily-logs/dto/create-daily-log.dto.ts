import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDailyLogDto {
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    timeSpent: number;

    @IsNotEmpty()
    @IsString()
    reflection: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    mood?: string;

    @IsOptional()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    isFavorite?: boolean;
}
