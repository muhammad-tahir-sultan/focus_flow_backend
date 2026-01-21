import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { Saving, SavingSchema } from './schemas/saving.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Saving.name, schema: SavingSchema }]),
    ],
    controllers: [SavingsController],
    providers: [SavingsService],
    exports: [SavingsService],
})
export class SavingsModule { }
