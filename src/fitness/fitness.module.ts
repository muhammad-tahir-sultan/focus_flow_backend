import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FitnessController } from './fitness.controller';
import { FitnessService } from './fitness.service';
import { FitnessLog, FitnessLogSchema } from './schemas/fitness-log.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: FitnessLog.name, schema: FitnessLogSchema }]),
    ],
    controllers: [FitnessController],
    providers: [FitnessService],
})
export class FitnessModule { }
