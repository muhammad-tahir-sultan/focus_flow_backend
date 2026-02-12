import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('challenge')
@UseGuards(AuthGuard('jwt'))
export class ChallengeController {
    constructor(private readonly challengeService: ChallengeService) { }

    @Get()
    async getChallengeProgress(@Request() req) {
        const userId = req.user.userId;
        return this.challengeService.getChallengeData(userId);
    }

    @Post('task')
    async toggleTask(
        @Request() req,
        @Body('task') task: string,
        @Body('completed') completed: boolean,
        @Body('value') value?: string,
        @Body('note') note?: string
    ) {
        const userId = req.user.userId;
        return this.challengeService.updateDailyLog(userId, task, completed, value, note);
    }
}
