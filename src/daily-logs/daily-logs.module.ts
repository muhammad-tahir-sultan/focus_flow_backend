import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyLogsController } from './daily-logs.controller';
import { DailyLogsService } from './daily-logs.service';
import { DailyLog, DailyLogSchema } from './schemas/daily-log.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DailyLog.name, schema: DailyLogSchema }]),
    ],
    controllers: [DailyLogsController],
    providers: [DailyLogsService],
})
export class DailyLogsModule { }
