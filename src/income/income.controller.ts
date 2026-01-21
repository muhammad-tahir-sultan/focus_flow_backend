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
    Query,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('income')
@UseGuards(AuthGuard('jwt'))
export class IncomeController {
    constructor(private readonly incomeService: IncomeService) { }

    @Post()
    create(@Body() createIncomeDto: CreateIncomeDto, @Request() req) {
        return this.incomeService.create(createIncomeDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.incomeService.findAll(req.user);
    }

    @Get('stats/category')
    getStatsByCategory(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.incomeService.getStatsByCategory(req.user, start, end);
    }

    @Get('stats/total')
    getTotalIncome(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.incomeService.getTotalIncome(req.user, start, end);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.incomeService.findOne(id, req.user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateIncomeDto: UpdateIncomeDto,
        @Request() req,
    ) {
        return this.incomeService.update(id, updateIncomeDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.incomeService.remove(id, req.user);
    }
}
