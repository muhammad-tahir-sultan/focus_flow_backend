import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDailyLogDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    timeSpent?: number;

    @IsOptional()
    @IsString()
    reflection?: string;
}
