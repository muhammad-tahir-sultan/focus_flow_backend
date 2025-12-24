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
        // Use provided date or default to today
        const logDate = createDailyLogDto.date ? new Date(createDailyLogDto.date) : new Date();
        logDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(logDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingLog = await this.dailyLogModel.findOne({
            user: user['_id'],
            date: {
                $gte: logDate,
                $lt: nextDay,
            },
        });

        if (existingLog) {
            throw new BadRequestException('A log already exists for this date. You can only have one log per day.');
        }

        const createdLog = new this.dailyLogModel({
            ...createDailyLogDto,
            date: logDate,
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

    async getExecutionStreak(user: User): Promise<{ date: string; value: number }[]> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const logs = await this.dailyLogModel.find({
            user: user['_id'],
            date: { $gte: thirtyDaysAgo },
        }).exec();

        // Create a map of dates that have logs
        const logDates = new Set(
            logs.map(log => {
                const d = new Date(log.date);
                d.setHours(0, 0, 0, 0);
                return d.toISOString().split('T')[0];
            })
        );

        // Generate last 30 days
        const result: { date: string; value: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
                date: dateStr,
                value: logDates.has(dateStr) ? 1 : 0,
            });
        }

        return result;
    }

    async getTimeInvested(user: User): Promise<{ date: string; value: number }[]> {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const logs = await this.dailyLogModel.find({
            user: user['_id'],
            date: { $gte: fourteenDaysAgo },
        }).exec();

        // Create a map of dates to time spent
        const timeMap = new Map<string, number>();
        logs.forEach(log => {
            const d = new Date(log.date);
            d.setHours(0, 0, 0, 0);
            const dateStr = d.toISOString().split('T')[0];
            timeMap.set(dateStr, (timeMap.get(dateStr) || 0) + log.timeSpent);
        });

        // Generate last 14 days
        const result: { date: string; value: number }[] = [];
        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
                date: dateStr,
                value: timeMap.get(dateStr) || 0,
            });
        }

        return result;
    }

    async getNonNegotiablesCompletion(user: User): Promise<{ completedCount: number; totalCount: number }> {
        const logs = await this.dailyLogModel.find({ user: user['_id'] }).exec();

        // Count non-negotiables from descriptions
        // Non-negotiables are marked with [x] in the description
        let completedCount = 0;
        let totalCount = 0;

        logs.forEach(log => {
            const description = log.description || '';
            // Count [x] as completed
            const completed = (description.match(/\[x\]/gi) || []).length;
            // Count [ ] as incomplete
            const incomplete = (description.match(/\[ \]/g) || []).length;

            completedCount += completed;
            totalCount += completed + incomplete;
        });

        return { completedCount, totalCount };
    }

    async getConsistency(user: User): Promise<{ week: number; value: number }[]> {
        const twentySixWeeksAgo = new Date();
        twentySixWeeksAgo.setDate(twentySixWeeksAgo.getDate() - (26 * 7));
        twentySixWeeksAgo.setHours(0, 0, 0, 0);

        const logs = await this.dailyLogModel.find({
            user: user['_id'],
            date: { $gte: twentySixWeeksAgo },
        }).exec();

        // Group logs by week
        const weekMap = new Map<number, Set<string>>();
        logs.forEach(log => {
            const logDate = new Date(log.date);
            const weeksDiff = Math.floor((new Date().getTime() - logDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            const weekNumber = 25 - weeksDiff; // 0-25 (26 weeks)

            if (weekNumber >= 0 && weekNumber < 26) {
                if (!weekMap.has(weekNumber)) {
                    weekMap.set(weekNumber, new Set());
                }
                const dateStr = logDate.toISOString().split('T')[0];
                weekMap.get(weekNumber)!.add(dateStr);
            }
        });

        // Generate result for 26 weeks
        const result: { week: number; value: number }[] = [];
        for (let i = 0; i < 26; i++) {
            result.push({
                week: i + 1,
                value: weekMap.get(i)?.size || 0,
            });
        }

        return result;
    }

    async findOne(id: string, user: User): Promise<DailyLog> {
        const log = await this.dailyLogModel.findOne({ _id: id, user: user['_id'] }).exec();
        if (!log) {
            throw new NotFoundException(`Daily log with ID ${id} not found`);
        }
        return log;
    }

    async update(id: string, updateDailyLogDto: any, user: User): Promise<DailyLog> {
        // If date is being updated, check for conflicts
        if (updateDailyLogDto.date) {
            const logDate = new Date(updateDailyLogDto.date);
            logDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(logDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const existingLog = await this.dailyLogModel.findOne({
                user: user['_id'],
                _id: { $ne: id }, // Exclude the current log being updated
                date: {
                    $gte: logDate,
                    $lt: nextDay,
                },
            });

            if (existingLog) {
                throw new BadRequestException('A log already exists for this date. You can only have one log per day.');
            }

            // Ensure the date is stored correctly
            updateDailyLogDto.date = logDate;
        }

        const updatedLog = await this.dailyLogModel.findOneAndUpdate(
            { _id: id, user: user['_id'] },
            { $set: updateDailyLogDto },
            { new: true }
        ).exec();

        if (!updatedLog) {
            throw new NotFoundException(`Daily log with ID ${id} not found`);
        }
        return updatedLog;
    }

    async remove(id: string, user: User): Promise<void> {
        const result = await this.dailyLogModel.deleteOne({ _id: id, user: user['_id'] }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Daily log with ID ${id} not found`);
        }
    }
}
