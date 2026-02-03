import { IsDateString, IsArray, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateEbayLogDto {
    @IsDateString()
    date: string;

    @IsArray()
    @IsString({ each: true })
    focusAreas: string[];

    @IsArray()
    @IsString({ each: true })
    tasksCompleted: string[];

    @IsNumber()
    timeSpentMinutes: number;

    @IsString()
    winOfTheDay: string;

    @IsString()
    blockerOrLesson: string;
}

export class UpdateEbayLogDto extends CreateEbayLogDto { }
