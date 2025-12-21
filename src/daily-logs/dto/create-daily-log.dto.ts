import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
}
