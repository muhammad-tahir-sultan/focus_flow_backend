import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiToolService } from './ai-tool.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai-tool')
@UseGuards(AuthGuard('jwt'))
export class AiToolController {
    constructor(private readonly aiToolService: AiToolService) { }

    @Post('process-requirement')
    async processRequirement(@Body('requirement') requirement: string) {
        return this.aiToolService.processClientRequirement(requirement);
    }

    @Post('generate-proposal')
    async generateProposal(@Body() data: any) {
        return this.aiToolService.generateProposal(data);
    }

    @Post('generate-invoice')
    async generateInvoice(@Body() data: any) {
        return this.aiToolService.generateInvoice(data);
    }
}
