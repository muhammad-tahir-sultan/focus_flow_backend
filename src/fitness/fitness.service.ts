import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FitnessLog, FitnessLogDocument } from './schemas/fitness-log.schema';
import { CreateFitnessLogDto } from './dto/create-fitness-log.dto';

@Injectable()
export class FitnessService {
    constructor(
        @InjectModel(FitnessLog.name)
        private fitnessLogModel: Model<FitnessLogDocument>,
    ) { }

    async upsertLog(userId: string, createFitnessLogDto: CreateFitnessLogDto) {
        const { date, ...updateData } = createFitnessLogDto;

        return this.fitnessLogModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), date },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );
    }

    async getLogByDate(userId: string, date: string) {
        return this.fitnessLogModel.findOne({
            userId: new Types.ObjectId(userId),
            date,
        });
    }

    async getAllLogs(userId: string) {
        return this.fitnessLogModel.find({ userId: new Types.ObjectId(userId) }).sort({ date: -1 });
    }

    async getStats(userId: string) {
        const logs = await this.fitnessLogModel.find({
            userId: new Types.ObjectId(userId),
        }).sort({ date: 1 });

        const totalLogs = logs.length;
        const workouts = logs.filter(l => l.workoutCompleted).length;
        const runs = logs.filter(l => l.runCompleted).length;
        const water = logs.filter(l => l.waterIntake).length;
        const sleep = logs.filter(l => l.sleepQuality).length;

        // Simple consistency (last 30 days)
        // In a real app, generate all dates for last 30 days and map.

        return {
            totalLogs,
            workouts,
            runs,
            water,
            sleep,
            logs // Return logs for frontend to chart
        };
    }
}
