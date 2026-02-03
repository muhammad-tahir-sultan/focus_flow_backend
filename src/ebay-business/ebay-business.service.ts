import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EbayTaskLog, EbayTaskLogDocument } from './schemas/ebay-task-log.schema';
import { CreateEbayLogDto, UpdateEbayLogDto } from './dto/create-ebay-log.dto';

@Injectable()
export class EbayBusinessService {
    constructor(
        @InjectModel(EbayTaskLog.name) private model: Model<EbayTaskLogDocument>,
    ) { }

    async create(userId: string, dto: CreateEbayLogDto) {
        // If a log for this date exists, update it or error? user might want to edit.
        // Let's assume one log per date.
        // Check if log exists for date (ignoring time)
        // Actually, let's just append for now to be simple, or user can edit. 
        // The requirement says "Daily Task Log (Use This Every Day)", implying one entry.

        // Let's check if entry exists for this day to update it instead of creating dupes if user re-submits?
        // For now, standard create.

        const log = new this.model({
            ...dto,
            userId: new Types.ObjectId(userId),
            date: new Date(dto.date),
        });
        return log.save();
    }

    async findAll(userId: string) {
        return this.model.find({ userId: new Types.ObjectId(userId) }).sort({ date: -1 }).exec();
    }

    async getStats(userId: string) {
        const logs = await this.findAll(userId);
        const totalTime = logs.reduce((acc, curr) => acc + curr.timeSpentMinutes, 0);

        // Calculate streak? (Optional enhancement)

        return { totalTime, logsCount: logs.length };
    }

    async findOne(id: string, userId: string) {
        return this.model.findOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
    }

    async update(id: string, userId: string, dto: UpdateEbayLogDto) {
        return this.model.findOneAndUpdate(
            { _id: id, userId: new Types.ObjectId(userId) },
            { ...dto, date: new Date(dto.date) },
            { new: true },
        );
    }

    async remove(id: string, userId: string) {
        return this.model.findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) });
    }
}
