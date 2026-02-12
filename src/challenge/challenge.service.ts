import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChallengeEntry, ChallengeEntryDocument } from './schemas/challenge.schema';

@Injectable()
export class ChallengeService {
    private readonly TOTAL_TASKS_COUNT = 8;

    constructor(
        @InjectModel(ChallengeEntry.name) private challengeEntryModel: Model<ChallengeEntryDocument>,
    ) { }

    async getTodayEntry(userId: string): Promise<ChallengeEntry> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let entry = await this.challengeEntryModel.findOne({
            userId: new Types.ObjectId(userId),
            date: today,
        });

        if (!entry) {
            entry = await this.challengeEntryModel.create({
                userId: new Types.ObjectId(userId),
                date: today,
                taskLogs: [],
                isFullyCompleted: false,
            });
        }

        return entry;
    }

    async getChallengeData(userId: string): Promise<any> {
        const todayEntry = await this.getTodayEntry(userId);
        const progress = await this.getProgress(userId);

        return {
            today: todayEntry,
            progress: progress
        };
    }

    async getProgress(userId: string): Promise<any> {
        const userObjectId = new Types.ObjectId(userId);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 60);
        startDate.setHours(0, 0, 0, 0);

        const entries = await this.challengeEntryModel.find({
            userId: userObjectId,
            date: { $gte: startDate },
        }).sort({ date: 1 });

        const totalDays = 60;
        const activeDays = entries.filter(e => e.taskLogs.some(log => log.completed)).length;
        const perfectDays = entries.filter(e => e.isFullyCompleted).length;

        return {
            history: entries,
            totalDays,
            activeDays,
            perfectDays,
            consistencyPercentage: (activeDays / totalDays) * 100,
            completionPercentage: (perfectDays / totalDays) * 100
        };
    }

    async updateDailyLog(userId: string, taskCode: string, completed: boolean, value = '', note = ''): Promise<ChallengeEntry> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const entry = await this.getTodayEntry(userId);

        const logIndex = entry.taskLogs.findIndex(log => log.taskCode === taskCode);

        if (logIndex > -1) {
            entry.taskLogs[logIndex].completed = completed;
            entry.taskLogs[logIndex].value = value;
            entry.taskLogs[logIndex].note = note;
        } else {
            entry.taskLogs.push({ taskCode, completed, value, note });
        }

        const completedCount = entry.taskLogs.filter(log => log.completed).length;
        entry.isFullyCompleted = completedCount >= this.TOTAL_TASKS_COUNT;

        return (entry as any).save();
    }

    async updateTaskStatus(userId: string, task: string, completed: boolean): Promise<ChallengeEntry> {
        return this.updateDailyLog(userId, task, completed);
    }
}
