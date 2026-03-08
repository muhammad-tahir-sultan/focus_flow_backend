import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LifeSystemController } from './life-system.controller';
import { LifeSystemService } from './life-system.service';
import { LifeSystem, LifeSystemSchema } from './schemas/life-system.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LifeSystem.name, schema: LifeSystemSchema }]),
  ],
  controllers: [LifeSystemController],
  providers: [LifeSystemService],
})
export class LifeSystemModule {}
