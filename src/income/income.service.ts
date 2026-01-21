import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Income, IncomeDocument } from './schemas/income.schema';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class IncomeService {
    constructor(
        @InjectModel(Income.name) private incomeModel: Model<IncomeDocument>,
    ) { }

    async create(createIncomeDto: CreateIncomeDto, user: User): Promise<Income> {
        const income = new this.incomeModel({
            ...createIncomeDto,
            user: user['_id'],
        });
        return income.save();
    }

    async findAll(user: User): Promise<Income[]> {
        return this.incomeModel
            .find({ user: user['_id'] })
            .sort({ date: -1 })
            .exec();
    }

    async findOne(id: string, user: User): Promise<Income> {
        const income = await this.incomeModel.findOne({ _id: id, user: user['_id'] }).exec();
        if (!income) {
            throw new NotFoundException(`Income with ID ${id} not found`);
        }
        return income;
    }

    async update(id: string, updateIncomeDto: UpdateIncomeDto, user: User): Promise<Income> {
        const income = await this.incomeModel
            .findOneAndUpdate(
                { _id: id, user: user['_id'] },
                updateIncomeDto,
                { new: true },
            )
            .exec();

        if (!income) {
            throw new NotFoundException(`Income with ID ${id} not found`);
        }
        return income;
    }

    async remove(id: string, user: User): Promise<void> {
        const result = await this.incomeModel.deleteOne({ _id: id, user: user['_id'] }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Income with ID ${id} not found`);
        }
    }

    async getStatsByCategory(user: User, startDate?: Date, endDate?: Date): Promise<any> {
        const matchStage: any = { user: user['_id'] };

        if (startDate || endDate) {
            matchStage.date = {};
            if (startDate) matchStage.date.$gte = startDate;
            if (endDate) matchStage.date.$lte = endDate;
        }

        return this.incomeModel.aggregate([
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

    async getTotalIncome(user: User, startDate?: Date, endDate?: Date): Promise<number> {
        const matchStage: any = { user: user['_id'] };

        if (startDate || endDate) {
            matchStage.date = {};
            if (startDate) matchStage.date.$gte = startDate;
            if (endDate) matchStage.date.$lte = endDate;
        }

        const result = await this.incomeModel.aggregate([
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
