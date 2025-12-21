import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyLog, DailyLogDocument } from './schemas/daily-log.schema';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class DailyLogsService {
    constructor(@InjectModel(DailyLog.name) private dailyLogModel: Model<DailyLogDocument>) { }

    async create(createDailyLogDto: CreateDailyLogDto, user: User): Promise<DailyLog> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingLog = await this.dailyLogModel.findOne({
            user: user['_id'],
            date: {
                $gte: today,
                $lt: tomorrow,
            },
        });

        if (existingLog) {
            throw new BadRequestException('You have already submitted your daily log for today.');
        }

        const createdLog = new this.dailyLogModel({
            ...createDailyLogDto,
            date: new Date(),
            user,
        });
        return createdLog.save();
    }

    async findAll(user: User): Promise<DailyLog[]> {
        return this.dailyLogModel.find({ user: user['_id'] }).sort({ date: -1 }).exec();
    }

    async getStats(user: User): Promise<any> {
        const logs = await this.dailyLogModel.find({ user: user['_id'] }).sort({ date: -1 }).exec();

        // Calculate streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if logged today
        const loggedToday = logs.length > 0 && logs[0].date >= today;

        // If logged today, streak starts at 1. If not, check yesterday.
        // Actually, simple logic: iterate backwards from today (or yesterday if missed today)

        // Simplified streak logic:
        // 1. Get all unique dates logged
        // 2. Check consecutive days

        // For now, return simple count and last log date
        return {
            totalLogs: logs.length,
            lastLogDate: logs.length > 0 ? logs[0].date : null,
            streak: 0, // TODO: Implement robust streak logic
        };
    }
}
