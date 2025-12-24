import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { TechnicalRoadmapService } from './technical-roadmap.service';
import { CreateTechnicalRoadmapDto } from './dto/create-technical-roadmap.dto';
import { UpdateTechnicalRoadmapDto } from './dto/update-technical-roadmap.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('technical-roadmaps')
export class TechnicalRoadmapController {
    constructor(private readonly roadmapService: TechnicalRoadmapService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createDto: CreateTechnicalRoadmapDto) {
        return this.roadmapService.create(createDto);
    }

    @Get()
    findAll(
        @Query('cursor') cursor: string,
        @Query('limit') limit: number,
        @Query('category') category: string,
    ) {
        return this.roadmapService.findAll(limit ? Number(limit) : 6, cursor, category);
    }

    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.roadmapService.findBySlug(slug);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() updateDto: UpdateTechnicalRoadmapDto) {
        return this.roadmapService.update(id, updateDto);
    }

    @Patch(':id/archive')
    @UseGuards(AuthGuard('jwt'))
    archive(@Param('id') id: string) {
        return this.roadmapService.archive(id);
    }
}
