import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FitnessService } from './fitness.service';
import { CreateFitnessLogDto } from './dto/create-fitness-log.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('fitness')
@UseGuards(AuthGuard('jwt'))
export class FitnessController {
    constructor(private readonly fitnessService: FitnessService) { }

    @Post('log')
    async logDaily(@Req() req, @Body() createFitnessLogDto: CreateFitnessLogDto) {
        return this.fitnessService.upsertLog(req.user.userId, createFitnessLogDto);
    }

    @Get('today')
    async getToday(@Req() req, @Query('date') date: string) {
        return this.fitnessService.getLogByDate(req.user.userId, date);
    }

    @Get('stats')
    async getStats(@Req() req) {
        return this.fitnessService.getStats(req.user.userId);
    }
}
