import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Saving, SavingDocument } from './schemas/saving.schema';
import { CreateSavingDto } from './dto/create-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class SavingsService {
    constructor(
        @InjectModel(Saving.name) private savingModel: Model<SavingDocument>,
    ) { }

    async create(createSavingDto: CreateSavingDto, user: User): Promise<Saving> {
        const saving = new this.savingModel({
            ...createSavingDto,
            currentAmount: createSavingDto.currentAmount || 0,
            user: user['_id'],
        });
        return saving.save();
    }

    async findAll(user: User): Promise<Saving[]> {
        return this.savingModel
            .find({ user: user['_id'] })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOne(id: string, user: User): Promise<Saving> {
        const saving = await this.savingModel.findOne({ _id: id, user: user['_id'] }).exec();
        if (!saving) {
            throw new NotFoundException(`Saving goal with ID ${id} not found`);
        }
        return saving;
    }

    async update(id: string, updateSavingDto: UpdateSavingDto, user: User): Promise<Saving> {
        const saving = await this.savingModel
            .findOneAndUpdate(
                { _id: id, user: user['_id'] },
                updateSavingDto,
                { new: true },
            )
            .exec();

        if (!saving) {
            throw new NotFoundException(`Saving goal with ID ${id} not found`);
        }
        return saving;
    }

    async addContribution(id: string, amount: number, user: User): Promise<Saving> {
        const saving = await this.findOne(id, user);
        const newAmount = saving.currentAmount + amount;

        return this.update(id, {
            currentAmount: newAmount,
            status: newAmount >= saving.targetAmount ? 'Completed' : saving.status
        } as UpdateSavingDto, user);
    }

    async remove(id: string, user: User): Promise<void> {
        const result = await this.savingModel.deleteOne({ _id: id, user: user['_id'] }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Saving goal with ID ${id} not found`);
        }
    }

    async getTotalSavings(user: User): Promise<number> {
        const result = await this.savingModel.aggregate([
            { $match: { user: user['_id'] } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$currentAmount' },
                },
            },
        ]);

        return result.length > 0 ? result[0].total : 0;
    }

    async getTotalTargets(user: User): Promise<number> {
        const result = await this.savingModel.aggregate([
            { $match: { user: user['_id'] } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$targetAmount' },
                },
            },
        ]);

        return result.length > 0 ? result[0].total : 0;
    }
}
