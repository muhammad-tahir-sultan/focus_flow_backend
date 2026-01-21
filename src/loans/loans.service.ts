import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Loan, LoanStatus, LoanType } from './schemas/loan.schema';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
    constructor(@InjectModel(Loan.name) private loanModel: Model<Loan>) { }

    async create(createLoanDto: CreateLoanDto, user: any): Promise<Loan> {
        const paidAmount = createLoanDto.paidAmount || 0;
        const loan = new this.loanModel({
            ...createLoanDto,
            paidAmount,
            user: user['_id'],
        });

        // Auto-set status based on payment
        if (paidAmount >= createLoanDto.amount) {
            loan.status = LoanStatus.FULLY_PAID;
        } else if (paidAmount > 0) {
            loan.status = LoanStatus.PARTIALLY_PAID;
        } else {
            loan.status = LoanStatus.ACTIVE;
        }

        return loan.save();
    }

    async findAll(user: any): Promise<Loan[]> {
        return this.loanModel.find({ user: user['_id'] }).sort({ date: -1 }).exec();
    }

    async findOne(id: string, user: any): Promise<Loan> {
        const loan = await this.loanModel.findOne({ _id: id, user: user['_id'] }).exec();
        if (!loan) {
            throw new NotFoundException(`Loan with ID ${id} not found`);
        }
        return loan;
    }

    async update(id: string, updateLoanDto: UpdateLoanDto, user: any): Promise<Loan> {
        const loan = await this.findOne(id, user);
        Object.assign(loan, updateLoanDto);

        // Auto-update status if paidAmount changed
        if (updateLoanDto.paidAmount !== undefined) {
            if (loan.paidAmount >= loan.amount) {
                loan.status = LoanStatus.FULLY_PAID;
            } else if (loan.paidAmount > 0) {
                loan.status = LoanStatus.PARTIALLY_PAID;
            } else {
                loan.status = LoanStatus.ACTIVE;
            }
        }

        return loan.save();
    }

    async remove(id: string, user: any): Promise<void> {
        const result = await this.loanModel.deleteOne({ _id: id, user: user['_id'] }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Loan with ID ${id} not found`);
        }
    }

    async addPayment(id: string, amount: number, user: any): Promise<Loan> {
        const loan = await this.findOne(id, user);
        loan.paidAmount += amount;

        // Auto-update status
        if (loan.paidAmount >= loan.amount) {
            loan.status = LoanStatus.FULLY_PAID;
        } else if (loan.paidAmount > 0) {
            loan.status = LoanStatus.PARTIALLY_PAID;
        }

        return loan.save();
    }

    // Analytics
    async getTotalTook(user: any): Promise<number> {
        const result = await this.loanModel.aggregate([
            { $match: { user: user['_id'], type: LoanType.TOOK } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result.length > 0 ? result[0].total : 0;
    }

    async getTotalGave(user: any): Promise<number> {
        const result = await this.loanModel.aggregate([
            { $match: { user: user['_id'], type: LoanType.GAVE } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result.length > 0 ? result[0].total : 0;
    }

    async getOutstandingTook(user: any): Promise<number> {
        const result = await this.loanModel.aggregate([
            { $match: { user: user['_id'], type: LoanType.TOOK } },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $subtract: ['$amount', '$paidAmount'] } },
                },
            },
        ]);
        return result.length > 0 ? result[0].total : 0;
    }

    async getOutstandingGave(user: any): Promise<number> {
        const result = await this.loanModel.aggregate([
            { $match: { user: user['_id'], type: LoanType.GAVE } },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $subtract: ['$amount', '$paidAmount'] } },
                },
            },
        ]);
        return result.length > 0 ? result[0].total : 0;
    }
}
