import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityLog, IdentityLogSchema } from './schemas/identity-log.schema';
import { IdentityLogsController } from './identity-logs.controller';
import { IdentityLogsService } from './identity-logs.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: IdentityLog.name, schema: IdentityLogSchema }]),
    ],
    controllers: [IdentityLogsController],
    providers: [IdentityLogsService],
    exports: [IdentityLogsService],
})
export class IdentityLogsModule { }
