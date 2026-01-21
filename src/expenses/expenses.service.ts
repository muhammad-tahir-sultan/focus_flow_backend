import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    ) { }

    async create(createExpenseDto: CreateExpenseDto, user: User): Promise<Expense> {
        const expense = new this.expenseModel({
            ...createExpenseDto,
            user: user['_id'],
        });
        return expense.save();
    }

    async findAll(user: User): Promise<Expense[]> {
        return this.expenseModel
            .find({ user: user['_id'] })
            .sort({ date: -1 })
            .exec();
    }

    async findOne(id: string, user: User): Promise<Expense> {
        const expense = await this.expenseModel.findOne({ _id: id, user: user['_id'] }).exec();
        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        return expense;
    }

    async update(id: string, updateExpenseDto: UpdateExpenseDto, user: User): Promise<Expense> {
        const expense = await this.expenseModel
            .findOneAndUpdate(
                { _id: id, user: user['_id'] },
                updateExpenseDto,
                { new: true },
            )
            .exec();

        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
        return expense;
    }

    async remove(id: string, user: User): Promise<void> {
        const result = await this.expenseModel.deleteOne({ _id: id, user: user['_id'] }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }
    }

    async getStatsByCategory(user: User, startDate?: Date, endDate?: Date): Promise<any> {
        const matchStage: any = { user: user['_id'] };

        if (startDate || endDate) {
            matchStage.date = {};
            if (startDate) matchStage.date.$gte = startDate;
            if (endDate) matchStage.date.$lte = endDate;
        }

        return this.expenseModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { total: -1 } },
        ]);
    }

    async getMonthlyStats(user: User, year: number): Promise<any> {
        return this.expenseModel.aggregate([
            {
                $match: {
                    user: user['_id'],
                    date: {
                        $gte: new Date(year, 0, 1),
                        $lt: new Date(year + 1, 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }

    async getTotalExpenses(user: User, startDate?: Date, endDate?: Date): Promise<number> {
        const matchStage: any = { user: user['_id'] };

        if (startDate || endDate) {
            matchStage.date = {};
            if (startDate) matchStage.date.$gte = startDate;
            if (endDate) matchStage.date.$lte = endDate;
        }

        const result = await this.expenseModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        return result.length > 0 ? result[0].total : 0;
    }
}
