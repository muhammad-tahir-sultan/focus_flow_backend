import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EbayBusinessService } from './ebay-business.service';
import { CreateEbayLogDto, UpdateEbayLogDto } from './dto/create-ebay-log.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('ebay-business')
@UseGuards(AuthGuard('jwt'))
export class EbayBusinessController {
    constructor(private readonly service: EbayBusinessService) { }

    @Post()
    create(@Request() req, @Body() createEbayLogDto: CreateEbayLogDto) {
        return this.service.create(req.user._id, createEbayLogDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.user._id);
    }

    @Get('stats')
    getStats(@Request() req) {
        return this.service.getStats(req.user._id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateEbayLogDto: UpdateEbayLogDto) {
        return this.service.update(id, req.user._id, updateEbayLogDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.service.remove(id, req.user._id);
    }
}
