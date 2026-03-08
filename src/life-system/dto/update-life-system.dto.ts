import { PartialType } from '@nestjs/mapped-types';

export class CreateLifeSystemDto {
  date: string;
}

export class UpdateLifeSystemDto extends PartialType(CreateLifeSystemDto) {
  fajrPrayer?: boolean;
  reflectionJournaling?: boolean;
  exercise30m?: boolean;
  deepWork4h?: boolean;
  
  skillBusinessWork?: boolean;
  networking?: boolean;
  learning?: boolean;
  
  nightReflection?: boolean;
  planningTomorrow?: boolean;
  
  stayedCalm?: boolean;
  honesty?: boolean;
  controlledDesires?: boolean;
  goodCommunication?: boolean;
  
  notes?: string;

  weeklyImprovedCharacter?: boolean;
  weeklyWorkedOnSkills?: boolean;
  weeklyControlledEmotions?: boolean;
  weeklyMovedCloserToFinance?: boolean;
  weeklyStayedDisciplined?: boolean;
}
