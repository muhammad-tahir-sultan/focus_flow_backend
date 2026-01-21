import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingDto } from './dto/create-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('savings')
@UseGuards(AuthGuard('jwt'))
export class SavingsController {
    constructor(private readonly savingsService: SavingsService) { }

    @Post()
    create(@Body() createSavingDto: CreateSavingDto, @Request() req) {
        return this.savingsService.create(createSavingDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.savingsService.findAll(req.user);
    }

    @Get('stats/total')
    getTotalSavings(@Request() req) {
        return this.savingsService.getTotalSavings(req.user);
    }

    @Get('stats/targets')
    getTotalTargets(@Request() req) {
        return this.savingsService.getTotalTargets(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.savingsService.findOne(id, req.user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateSavingDto: UpdateSavingDto,
        @Request() req,
    ) {
        return this.savingsService.update(id, updateSavingDto, req.user);
    }

    @Patch(':id/contribute')
    addContribution(
        @Param('id') id: string,
        @Body('amount') amount: number,
        @Request() req,
    ) {
        return this.savingsService.addContribution(id, amount, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.savingsService.remove(id, req.user);
    }
}
