import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { ChallengeEntry, ChallengeEntrySchema } from './schemas/challenge.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChallengeEntry.name, schema: ChallengeEntrySchema },
        ]),
    ],
    controllers: [ChallengeController],
    providers: [ChallengeService],
    exports: [ChallengeService],
})
export class ChallengeModule { }