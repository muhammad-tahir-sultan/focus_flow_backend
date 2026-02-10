import { Module } from '@nestjs/common';
import { AiToolService } from './ai-tool.service';
import { AiToolController } from './ai-tool.controller';

@Module({
    providers: [AiToolService],
    controllers: [AiToolController],
    exports: [AiToolService],
})
export class AiToolModule { }
