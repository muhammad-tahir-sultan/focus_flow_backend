import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { AddPaymentDto } from './dto/add-payment.dto';

@Controller('loans')
@UseGuards(AuthGuard('jwt'))
export class LoansController {
    constructor(private readonly loansService: LoansService) { }

    @Post()
    create(@Body() createLoanDto: CreateLoanDto, @Request() req) {
        return this.loansService.create(createLoanDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.loansService.findAll(req.user);
    }

    @Get('stats/total-took')
    getTotalTook(@Request() req) {
        return this.loansService.getTotalTook(req.user);
    }

    @Get('stats/total-gave')
    getTotalGave(@Request() req) {
        return this.loansService.getTotalGave(req.user);
    }

    @Get('stats/outstanding-took')
    getOutstandingTook(@Request() req) {
        return this.loansService.getOutstandingTook(req.user);
    }

    @Get('stats/outstanding-gave')
    getOutstandingGave(@Request() req) {
        return this.loansService.getOutstandingGave(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.loansService.findOne(id, req.user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto, @Request() req) {
        return this.loansService.update(id, updateLoanDto, req.user);
    }

    @Patch(':id/payment')
    addPayment(@Param('id') id: string, @Body() addPaymentDto: AddPaymentDto, @Request() req) {
        return this.loansService.addPayment(id, addPaymentDto.amount, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.loansService.remove(id, req.user);
    }
}
