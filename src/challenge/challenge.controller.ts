import { Body, Controller, Get, Post, Put, Query, UseGuards, Request } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('challenge')
@UseGuards(AuthGuard('jwt'))
export class ChallengeController {
    constructor(private readonly challengeService: ChallengeService) { }

    @Get()
    async getChallengeProgress(@Request() req) {
        const userId = req.user.userId;
        // Get stats for the user
        // Return:
        // 1. Today's entry (tasks completed)
        // 2. 60-day history (for heatmap/consistency graph)
        // 3. Current streak

        // I need to implement a comprehensive method in service or call multiple.
        // Let's call a new method `getChallengeData`.
        return this.challengeService.getChallengeData(userId);
    }

    @Post('task')
    async toggleTask(
        @Request() req,
        @Body('task') task: string,
        @Body('completed') completed: boolean
    ) {
        const userId = req.user.userId;
        return this.challengeService.updateTaskStatus(userId, task, completed);
    }
}
