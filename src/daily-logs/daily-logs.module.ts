import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyLogsController } from './daily-logs.controller';
import { DailyLogsService } from './daily-logs.service';
import { DailyLog, DailyLogSchema } from './schemas/daily-log.schema';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DailyLog.name, schema: DailyLogSchema }]),
        RedisModule,
    ],
    controllers: [DailyLogsController],
    providers: [DailyLogsService],
})
export class DailyLogsModule { }
