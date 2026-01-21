import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { Loan, LoanSchema } from './schemas/loan.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Loan.name, schema: LoanSchema }])],
    controllers: [LoansController],
    providers: [LoansService],
})
export class LoansModule { }
