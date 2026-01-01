import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyLog, DailyLogDocument } from './schemas/daily-log.schema';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { User } from '../users/schemas/user.schema';
import { REDIS_CLIENT } from '../redis/redis.module';
import type { RedisClientType } from 'redis';

@Injectable()
export class DailyLogsService {
    constructor(
        @InjectModel(DailyLog.name) private dailyLogModel: Model<DailyLogDocument>,
        @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType
    ) { }

    private async getCacheKey(userId: string, method: string, params: any = {}): Promise<string> {
        return `user:${userId}:dailylogs:${method}:${JSON.stringify(params)}`;
    }

    private async invalidateUserCache(userId: string): Promise<void> {
        const keysKey = `user:${userId}:dailylogs:keys`;
        const keys = await this.redisClient.sMembers(keysKey);
        if (keys.length > 0) {
            await this.redisClient.del(keys);
        }
        await this.redisClient.del(keysKey);
    }

    private async cacheResult(userId: string, key: string, data: any): Promise<void> {
        const keysKey = `user:${userId}:dailylogs:keys`;
        await this.redisClient.set(key, JSON.stringify(data), { EX: 3600 }); // 1 hour TTL
        await this.redisClient.sAdd(keysKey, key);
    }

    async create(createDailyLogDto: CreateDailyLogDto, user: User): Promise<DailyLog> {
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

        const savedLog = await createdLog.save();
        await this.invalidateUserCache(user['_id'].toString());
        return savedLog;
    }

    async findAll(user: User, filters?: {
        mood?: string,
        startDate?: string,
        endDate?: string,
        isFavorite?: boolean
    }): Promise<DailyLog[]> {
        const userId = user['_id'].toString();
        const cacheKey = await this.getCacheKey(userId, 'findAll', filters);
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

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

        const logs = await this.dailyLogModel.find(query).sort({ date: -1 }).exec();
        await this.cacheResult(userId, cacheKey, logs);
        return logs;
    }

    async getStats(user: User): Promise<any> {
        const userId = user['_id'].toString();
        const cacheKey = await this.getCacheKey(userId, 'getStats');
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const logs = await this.dailyLogModel.find({ user: user['_id'] }).sort({ date: -1 }).exec();

        let result;
        if (logs.length === 0) {
            result = {
                totalLogs: 0,
                streak: 0,
                avgFocus: 0,
                improvement: 0,
                totalTime: 0
            };
        } else {
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

            result = {
                totalLogs: logs.length,
                streak,
                avgFocus: Number(avgFocus.toFixed(1)),
                improvement: Number(improvement.toFixed(1)),
                totalTime,
                lastLogDate: logs[0].date
            };
        }

        await this.cacheResult(userId, cacheKey, result);
        return result;
    }

    async getExecutionStreak(user: User): Promise<{ date: string; value: number }[]> {
        const userId = user['_id'].toString();
        const cacheKey = await this.getCacheKey(userId, 'getExecutionStreak');
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

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

        await this.cacheResult(userId, cacheKey, result);
        return result;
    }

    async getTimeInvested(user: User): Promise<{ date: string; value: number }[]> {
        const userId = user['_id'].toString();
        const cacheKey = await this.getCacheKey(userId, 'getTimeInvested');
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

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

        await this.cacheResult(userId, cacheKey, result);
        return result;
    }

    async getNonNegotiablesCompletion(user: User): Promise<{ completedCount: number; totalCount: number }> {
        const userId = user['_id'].toString();
        const cacheKey = await this.getCacheKey(userId, 'getNonNegotiablesCompletion');
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

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

        const result = { completedCount, totalCount };
        await this.cacheResult(userId, cacheKey, result);
        return result;
    }

    async getConsistency(user: User): Promise<{ week: number; value: number }[]> {
        const userId = user['_id'].toString();
        const cacheKey = await this.getCacheKey(userId, 'getConsistency');
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

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

        await this.cacheResult(userId, cacheKey, result);
        return result;
    }

    async findOne(id: string, user: User): Promise<DailyLog> {
        // Typically singular finds might not need caching if they change often, or they can be cached by ID.
        // For simplicity and coherence with bulk gets, and given usage patterns (viewing specific log), we can cache this optionally.
        // But since this is specific ID fetch, and invalidation is complex if we have to track every ID, we might skip or do simple caching.
        // Given project scope, let's leave it direct or implement simple caching.
        // For now, I'll stick to caching aggregations and lists which are heavy. 
        // Single log fetch is fast by ID. But let's verify if user wants ALL calls cached. 
        // "implement redis caching on daily logs service and invalidate on mutation"
        // I will add caching here too for completeness.

        const userId = user['_id'].toString();
        const cacheKey = await this.getCacheKey(userId, 'findOne', { id });
        const cachedData = await this.redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const log = await this.dailyLogModel.findOne({ _id: id, user: user['_id'] }).exec();
        if (!log) {
            throw new NotFoundException(`Daily log with ID ${id} not found`);
        }

        await this.cacheResult(userId, cacheKey, log);
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

        await this.invalidateUserCache(user['_id'].toString());
        return updatedLog;
    }

    async remove(id: string, user: User): Promise<void> {
        const result = await this.dailyLogModel.deleteOne({ _id: id, user: user['_id'] }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Daily log with ID ${id} not found`);
        }
        await this.invalidateUserCache(user['_id'].toString());
    }
}
