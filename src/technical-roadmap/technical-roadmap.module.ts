import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechnicalRoadmapService } from './technical-roadmap.service';
import { SeedingService } from './technical-roadmap.seed';
import { TechnicalRoadmapController } from './technical-roadmap.controller';
import { TechnicalRoadmap, TechnicalRoadmapSchema } from './schemas/technical-roadmap.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: TechnicalRoadmap.name, schema: TechnicalRoadmapSchema }]),
    ],
    controllers: [TechnicalRoadmapController],
    providers: [TechnicalRoadmapService, SeedingService],
    exports: [TechnicalRoadmapService],
})
export class TechnicalRoadmapModule { }
