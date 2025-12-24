import { PartialType } from '@nestjs/mapped-types';
import { CreateTechnicalRoadmapDto } from './create-technical-roadmap.dto';

export class UpdateTechnicalRoadmapDto extends PartialType(CreateTechnicalRoadmapDto) { }
