import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('checklist')
    async getChecklist(@Request() req) {
        return this.usersService.getChecklist(req.user.sub || req.user._id);
    }

    @Put('checklist')
    async updateChecklist(@Request() req, @Body() body: { checklist: string[] }) {
        return this.usersService.updateChecklist(req.user.sub || req.user._id, body.checklist);
    }
}
