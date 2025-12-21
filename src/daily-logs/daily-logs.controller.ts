import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DailyLogsService } from './daily-logs.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('daily-logs')
@UseGuards(AuthGuard('jwt'))
export class DailyLogsController {
    constructor(private readonly dailyLogsService: DailyLogsService) { }

    @Post()
    create(@Body() createDailyLogDto: CreateDailyLogDto, @Request() req) {
        return this.dailyLogsService.create(createDailyLogDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.dailyLogsService.findAll(req.user);
    }

    @Get('stats')
    getStats(@Request() req) {
        return this.dailyLogsService.getStats(req.user);
    }

    @Get('analytics/streak')
    getExecutionStreak(@Request() req) {
        return this.dailyLogsService.getExecutionStreak(req.user);
    }

    @Get('analytics/time-invested')
    getTimeInvested(@Request() req) {
        return this.dailyLogsService.getTimeInvested(req.user);
    }

    @Get('analytics/non-negotiables')
    getNonNegotiablesCompletion(@Request() req) {
        return this.dailyLogsService.getNonNegotiablesCompletion(req.user);
    }

    @Get('analytics/consistency')
    getConsistency(@Request() req) {
        return this.dailyLogsService.getConsistency(req.user);
    }
}
