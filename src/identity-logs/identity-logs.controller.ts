import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { IdentityLogsService } from './identity-logs.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateIdentityLogDto } from './dto/create-identity-log.dto';

@Controller('identity-logs')
@UseGuards(AuthGuard('jwt'))
export class IdentityLogsController {
    constructor(private readonly service: IdentityLogsService) { }

    @Post()
    async logDay(@Request() req, @Body() dto: CreateIdentityLogDto) {
        return this.service.logDay(req.user.userId, dto);
    }

    @Get('stats')
    async getStats(@Request() req) {
        return this.service.getStats(req.user.userId);
    }

    @Get(':date')
    async getLog(@Request() req, @Param('date') date: string) {
        return this.service.getLog(req.user.userId, date);
    }
}
