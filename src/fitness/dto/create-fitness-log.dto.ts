import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateFitnessLogDto {
    @IsString()
    date: string; // YYYY-MM-DD

    @IsBoolean()
    @IsOptional()
    workoutCompleted?: boolean;

    @IsBoolean()
    @IsOptional()
    runCompleted?: boolean;

    @IsBoolean()
    @IsOptional()
    waterIntake?: boolean;

    @IsBoolean()
    @IsOptional()
    sleepQuality?: boolean;

    @IsBoolean()
    @IsOptional()
    stretchDone?: boolean;
}
