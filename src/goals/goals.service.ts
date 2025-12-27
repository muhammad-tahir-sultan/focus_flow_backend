import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Goal, GoalDocument } from './schemas/goal.schema';
import { CreateGoalDto } from './dto/create-goal.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class GoalsService {
    constructor(@InjectModel(Goal.name) private goalModel: Model<GoalDocument>) { }

    async create(createGoalDto: CreateGoalDto, user: User): Promise<Goal> {
        const startDate = new Date();
        let endDate = new Date();

        // Calculate end date based on horizon
        switch (createGoalDto.horizon) {
            case 'Daily':
                endDate.setDate(startDate.getDate() + 1);
                break;
            case '30 Days':
                endDate.setDate(startDate.getDate() + 30);
                break;
            case '3 Months':
                endDate.setMonth(startDate.getMonth() + 3);
                break;
            case '6 Months':
                endDate.setMonth(startDate.getMonth() + 6);
                break;
            case '1 Year':
                endDate.setFullYear(startDate.getFullYear() + 1);
                break;
            case '2 Years':
                endDate.setFullYear(startDate.getFullYear() + 2);
                break;
            case '3 Years':
                endDate.setFullYear(startDate.getFullYear() + 3);
                break;
            case '5 Years':
                endDate.setFullYear(startDate.getFullYear() + 5);
                break;
            default:
                endDate.setDate(startDate.getDate() + 30); // Default
        }

        const createdGoal = new this.goalModel({
            ...createGoalDto,
            startDate,
            endDate,
            user,
        });
        return createdGoal.save();
    }

    async findAll(user: User): Promise<Goal[]> {
        return this.goalModel.find({ user: user['_id'] }).exec();
    }

    async findOne(id: string, user: User): Promise<Goal> {
        const goal = await this.goalModel.findOne({ _id: id, user: user['_id'] }).exec();
        if (!goal) {
            throw new NotFoundException(`Goal #${id} not found`);
        }
        return goal;
    }

    async updateStatus(id: string, status: string, user: User, dropReason?: string): Promise<Goal> {
        const update: any = { status };
        if (dropReason !== undefined) update.dropReason = dropReason;

        const goal = await this.goalModel.findOneAndUpdate(
            { _id: id, user: user['_id'] },
            update,
            { new: true },
        ).exec();

        if (!goal) {
            throw new NotFoundException(`Goal #${id} not found`);
        }
        return goal;
    }
}
