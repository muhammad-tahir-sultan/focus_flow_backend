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
}
