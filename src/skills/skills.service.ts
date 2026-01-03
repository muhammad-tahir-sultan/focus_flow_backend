import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class SkillsService {
    constructor(@InjectModel(Skill.name) private skillModel: Model<SkillDocument>) { }

    async create(createSkillDto: CreateSkillDto, user: UserDocument): Promise<Skill> {
        const newSkill = new this.skillModel({
            ...createSkillDto,
            user: user._id,
        });
        return newSkill.save();
    }

    async findAll(user: UserDocument, startDate?: string, endDate?: string): Promise<Skill[]> {
        const query: any = { user: user._id as any };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        return this.skillModel.find(query).sort({ date: -1, createdAt: -1 }).exec();
    }

    async remove(id: string, user: UserDocument): Promise<void> {
        const result = await this.skillModel.deleteOne({ _id: id, user: user._id as any }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Skill with ID "${id}" not found`);
        }
    }
}
