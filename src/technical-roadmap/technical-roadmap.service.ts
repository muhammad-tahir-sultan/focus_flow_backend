import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TechnicalRoadmap, TechnicalRoadmapDocument } from './schemas/technical-roadmap.schema';
import { CreateTechnicalRoadmapDto } from './dto/create-technical-roadmap.dto';
import { UpdateTechnicalRoadmapDto } from './dto/update-technical-roadmap.dto';

@Injectable()
export class TechnicalRoadmapService {
    constructor(@InjectModel(TechnicalRoadmap.name) private roadmapModel: Model<TechnicalRoadmapDocument>) { }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async create(createDto: CreateTechnicalRoadmapDto): Promise<TechnicalRoadmap> {
        const slug = this.generateSlug(createDto.title);
        const existing = await this.roadmapModel.findOne({ slug }).exec();
        if (existing) {
            throw new ConflictException('A roadmap with this title/slug already exists');
        }

        const created = new this.roadmapModel({
            ...createDto,
            slug,
        });
        return created.save();
    }

    async findAll(limit: number = 6, cursor?: string, category?: string): Promise<any> {
        const query: any = { isArchived: false };
        if (category) {
            query.category = category;
        }

        // Fetch all items first (we'll apply cursor logic after sorting)
        const allItems = await this.roadmapModel.find(query).exec();

        // Sort by learning hierarchy: Priority (High→Medium→Low) → Difficulty (easy→hard) → Category
        const priorityWeight = { 'High': 1, 'Medium': 2, 'Low': 3 };
        const sorted = allItems.sort((a, b) => {
            // 1. Priority (High first)
            const priorityDiff = (priorityWeight[a.priority] || 999) - (priorityWeight[b.priority] || 999);
            if (priorityDiff !== 0) return priorityDiff;

            // 2. Difficulty (easier first for foundational learning)
            const difficultyDiff = a.difficulty - b.difficulty;
            if (difficultyDiff !== 0) return difficultyDiff;

            // 3. Category (alphabetical)
            return a.category.localeCompare(b.category);
        });

        // Apply cursor-based pagination after sorting
        let filteredItems = sorted;
        if (cursor) {
            const cursorIndex = sorted.findIndex(item => (item as any).createdAt.toISOString() === cursor);
            if (cursorIndex !== -1) {
                filteredItems = sorted.slice(cursorIndex + 1);
            }
        }

        // Paginate
        const items = filteredItems.slice(0, limit);
        let nextCursor = null;
        if (filteredItems.length > limit) {
            nextCursor = (items[items.length - 1] as any).createdAt.toISOString();
        }

        return {
            items,
            nextCursor,
        };
    }

    async findBySlug(slug: string): Promise<TechnicalRoadmap> {
        const roadmap = await this.roadmapModel.findOne({ slug, isArchived: false }).exec();
        if (!roadmap) {
            throw new NotFoundException(`Roadmap with slug ${slug} not found`);
        }
        return roadmap as any;
    }

    async update(id: string, updateDto: UpdateTechnicalRoadmapDto): Promise<TechnicalRoadmap> {
        const roadmap = await this.roadmapModel.findById(id).exec();
        if (!roadmap) {
            throw new NotFoundException(`Roadmap with ID ${id} not found`);
        }

        if (updateDto.title && updateDto.title !== roadmap.title) {
            (updateDto as any).slug = this.generateSlug(updateDto.title);
        }

        return this.roadmapModel.findByIdAndUpdate(id, updateDto, { new: true }).exec() as any;
    }

    async archive(id: string): Promise<TechnicalRoadmap> {
        const roadmap = await this.roadmapModel.findByIdAndUpdate(id, { isArchived: true }, { new: true }).exec();
        if (!roadmap) {
            throw new NotFoundException(`Roadmap with ID ${id} not found`);
        }
        return roadmap as any;
    }
}
