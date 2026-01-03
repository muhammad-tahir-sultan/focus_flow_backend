import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('skills')
@UseGuards(AuthGuard('jwt'))
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) { }

    @Post()
    create(@Body() createSkillDto: CreateSkillDto, @Request() req) {
        return this.skillsService.create(createSkillDto, req.user);
    }

    @Get()
    findAll(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.skillsService.findAll(req.user, startDate, endDate);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.skillsService.remove(id, req.user);
    }
}
