import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChallengeEntry, ChallengeEntryDocument } from './schemas/challenge.schema';

@Injectable()
export class ChallengeService {
    private readonly TOTAL_TASKS_COUNT = 8; // Number of tasks in the list

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
                completedTasks: [],
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
        startDate.setDate(startDate.getDate() - 60); // 2 months lookback
        startDate.setHours(0, 0, 0, 0);

        const entries = await this.challengeEntryModel.find({
            userId: userObjectId,
            date: { $gte: startDate },
        }).sort({ date: 1 });

        const totalDays = 60;
        // Count days where at least one task was done for consistency? Or fully completed?
        // User asked for "progress bar that will track analytics based on daily entries... when one point is completed means as ticked, then after 2 months what will be achieved"
        // "record it 2 months consistency".
        // I interpret this as consistently showing up.
        // Let's track days with ANY activity vs FULL completion.

        const activeDays = entries.filter(e => e.completedTasks.length > 0).length;
        const perfectDays = entries.filter(e => e.isFullyCompleted).length;

        return {
            history: entries,
            totalDays,
            activeDays,
            perfectDays,
            consistencyPercentage: (activeDays / totalDays) * 100, // Show consistency
            completionPercentage: (perfectDays / totalDays) * 100
        };
    }

    async updateTaskStatus(userId: string, task: string, completed: boolean): Promise<ChallengeEntry> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updateQuery = completed
            ? { $addToSet: { completedTasks: task } }
            : { $pull: { completedTasks: task } };

        const entry = await this.challengeEntryModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), date: today },
            updateQuery,
            { new: true, upsert: true }
        );

        // Update isFullyCompleted
        const isFullyCompleted = entry.completedTasks.length >= this.TOTAL_TASKS_COUNT;

        if (entry.isFullyCompleted !== isFullyCompleted) {
            entry.isFullyCompleted = isFullyCompleted;
            await entry.save();
        }

        return entry;
    }
}
