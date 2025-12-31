import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyLog, DailyLogDocument } from './schemas/daily-log.schema';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { User } from '../users/schemas/user.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class DailyLogsService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectModel(DailyLog.name) private dailyLogModel: Model<DailyLogDocument>,
    ) { }


    async create(createDailyLogDto: CreateDailyLogDto, user: User): Promise<DailyLog> {
        // Use provided date or default to today
        const logDate = createDailyLogDto.date ? new Date(createDailyLogDto.date) : new Date();
        logDate.setHours(0, 0, 0, 0);

        const cacheKey = `daily_log_${user.email}_${logDate.getTime()}`;

        const cachedLog = await this.cacheManager.get(cacheKey);
        if (cachedLog) {
            throw new BadRequestException('A log already exists for this date (Cached).');
        }

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
            await this.cacheManager.set(cacheKey, true, 3600000);
            throw new BadRequestException('A log already exists for this date. You can only have one log per day.');
        }

        const createdLog = new this.dailyLogModel({
            ...createDailyLogDto,
            date: logDate,
            user,
        });


        const savedLog = await createdLog.save();

        await this.cacheManager.set(cacheKey, savedLog, 86400000)

        await this.cacheManager.del(`latest_logs_${user.email}`);


        return createdLog.save();
    }

    async findAll(user: User, filters?: {
        mood?: string,
        startDate?: string,
        endDate?: string,
        isFavorite?: boolean
    }): Promise<DailyLog[]> {
        const query: any = { user: user['_id'] };

        if (filters?.mood && filters.mood !== 'all') {
            query.mood = filters.mood;
        }

        if (filters?.isFavorite !== undefined) {
            query.isFavorite = filters.isFavorite;
        }

        if (filters?.startDate || filters?.endDate) {
            query.date = {};
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                query.date.$gte = start;
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        return this.dailyLogModel.find(query).sort({ date: -1 }).exec();
    }

    async getStats(user: User): Promise<any> {
        const logs = await this.dailyLogModel.find({ user: user['_id'] }).sort({ date: -1 }).exec();

        if (logs.length === 0) {
            return {
                totalLogs: 0,
                streak: 0,
                avgFocus: 0,
                improvement: 0,
                totalTime: 0
            };
        }

        // 1. Calculate Streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get unique dates
        const logDates = new Set(logs.map(log => {
            const d = new Date(log.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        }));

        let checkDate = logDates.has(today.getTime()) ? today : yesterday;

        while (logDates.has(checkDate.getTime())) {
            streak++;
            checkDate = new Date(checkDate);
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // 2. Calculate Avg Focus (last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const recentLogs = logs.filter(l => new Date(l.date) >= thirtyDaysAgo);
        const previousLogs = logs.filter(l => new Date(l.date) >= sixtyDaysAgo && new Date(l.date) < thirtyDaysAgo);

        const avgFocus = recentLogs.length > 0
            ? recentLogs.reduce((sum, l) => sum + l.timeSpent, 0) / recentLogs.length
            : 0;

        const prevAvgFocus = previousLogs.length > 0
            ? previousLogs.reduce((sum, l) => sum + l.timeSpent, 0) / previousLogs.length
            : 0;

        const improvement = avgFocus - prevAvgFocus;

        const totalTime = logs.reduce((sum, l) => sum + (l.timeSpent || 0), 0);

        return {
            totalLogs: logs.length,
            streak,
            avgFocus: Number(avgFocus.toFixed(1)),
            improvement: Number(improvement.toFixed(1)),
            totalTime,
            lastLogDate: logs[0].date
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
