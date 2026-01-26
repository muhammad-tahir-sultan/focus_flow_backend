import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

const DEFAULT_NON_NEGOTIABLES = [
    'Career: 10 Client Outreach + 1 LinkedIn Post',
    'Physique: Workout (45 mins) + Reduce Tea (2x)',
    'Degree: Study Degree Subjects (1 hour)',
    'Communication: Practice English (30 mins)',
    'Skills: Learn/Code New Tech (1 hour)',
    'Mindset: Control List Review + Daily Reflection'
];

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async getChecklist(userId: string): Promise<string[]> {
        const user = await this.userModel.findById(userId);
        if (user && user.dailyChecklist && user.dailyChecklist.length > 0) {
            return user.dailyChecklist;
        }
        // Return default if empty (Migrate on the fly)
        return DEFAULT_NON_NEGOTIABLES;
    }

    async updateChecklist(userId: string, checklist: string[]): Promise<string[]> {
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { dailyChecklist: checklist },
            { new: true }
        );
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.dailyChecklist;
    }
}
