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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'))
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
        return this.expensesService.create(createExpenseDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.expensesService.findAll(req.user);
    }

    @Get('stats/category')
    getStatsByCategory(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.expensesService.getStatsByCategory(req.user, start, end);
    }

    @Get('stats/monthly')
    getMonthlyStats(@Request() req, @Query('year') year?: string) {
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        return this.expensesService.getMonthlyStats(req.user, targetYear);
    }

    @Get('stats/total')
    getTotalExpenses(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.expensesService.getTotalExpenses(req.user, start, end);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.expensesService.findOne(id, req.user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateExpenseDto: UpdateExpenseDto,
        @Request() req,
    ) {
        return this.expensesService.update(id, updateExpenseDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.expensesService.remove(id, req.user);
    }
}
