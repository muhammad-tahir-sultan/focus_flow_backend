import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('goals')
@UseGuards(AuthGuard('jwt'))
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) { }

    @Post()
    create(@Body() createGoalDto: CreateGoalDto, @Request() req) {
        return this.goalsService.create(createGoalDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.goalsService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.goalsService.findOne(id, req.user);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string; dropReason?: string },
        @Request() req
    ) {
        return this.goalsService.updateStatus(id, body.status, req.user, body.dropReason);
    }
}
