import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EbayBusinessService } from './ebay-business.service';
import { EbayBusinessController } from './ebay-business.controller';
import { EbayTaskLog, EbayTaskLogSchema } from './schemas/ebay-task-log.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: EbayTaskLog.name, schema: EbayTaskLogSchema }]),
    ],
    controllers: [EbayBusinessController],
    providers: [EbayBusinessService],
})
export class EbayBusinessModule { }
