import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdentityLog, IdentityLogDocument } from './schemas/identity-log.schema';
import { CreateIdentityLogDto } from './dto/create-identity-log.dto';

@Injectable()
export class IdentityLogsService {
    constructor(@InjectModel(IdentityLog.name) private model: Model<IdentityLogDocument>) { }

    async logDay(userId: string, dto: CreateIdentityLogDto) {
        return this.model.findOneAndUpdate(
            { user: userId as any, date: dto.date },
            {
                ...dto,
                user: userId as any
            },
            { upsert: true, new: true }
        );
    }

    async getLog(userId: string, date: string) {
        const log = await this.model.findOne({ user: userId as any, date });
        return log || { date, month: 1, completedItems: [], completionPercentage: 0 };
    }

    async getStats(userId: string) {
        // Return last 30 entries sorted by date asc
        const logs = await this.model.find({ user: userId as any }).sort({ date: -1 }).limit(30);
        return logs.reverse();
    }
}
