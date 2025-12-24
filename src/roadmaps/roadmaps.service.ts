import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Roadmap, RoadmapDocument } from './schemas/roadmap.schema';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';

@Injectable()
export class RoadmapsService {
    constructor(@InjectModel(Roadmap.name) private roadmapModel: Model<RoadmapDocument>) { }

    async create(createRoadmapDto: CreateRoadmapDto): Promise<Roadmap> {
        const createdRoadmap = new this.roadmapModel(createRoadmapDto);
        return createdRoadmap.save();
    }

    async findAll(): Promise<Roadmap[]> {
        return this.roadmapModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Roadmap> {
        const roadmap = await this.roadmapModel.findById(id).exec();
        if (!roadmap) {
            throw new NotFoundException(`Roadmap with ID ${id} not found`);
        }
        return roadmap;
    }

    async update(id: string, updateRoadmapDto: UpdateRoadmapDto): Promise<Roadmap> {
        const updatedRoadmap = await this.roadmapModel
            .findByIdAndUpdate(id, updateRoadmapDto, { new: true })
            .exec();
        if (!updatedRoadmap) {
            throw new NotFoundException(`Roadmap with ID ${id} not found`);
        }
        return updatedRoadmap;
    }

    async remove(id: string): Promise<void> {
        const result = await this.roadmapModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Roadmap with ID ${id} not found`);
        }
    }
}
