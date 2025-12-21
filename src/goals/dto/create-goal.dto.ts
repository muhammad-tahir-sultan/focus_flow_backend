import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GoalCategory, GoalHorizon } from '../schemas/goal.schema';

export class CreateGoalDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsEnum(GoalCategory)
    category: GoalCategory;

    @IsNotEmpty()
    @IsEnum(GoalHorizon)
    horizon: GoalHorizon;
}
