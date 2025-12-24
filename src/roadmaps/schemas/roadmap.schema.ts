import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoadmapDocument = Roadmap & Document;

@Schema({ timestamps: true })
export class Roadmap {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    category: string; // e.g., 'Frontend', 'Backend', 'DevOps'

    @Prop({ type: [String], default: [] })
    weeklyMilestones: string[];

    @Prop({ type: [String], default: [] })
    resources: string[];

    @Prop({ default: 'Intermediate' })
    difficulty: string; // 'Beginner', 'Intermediate', 'Advanced'

    @Prop({ default: true })
    isActive: boolean;
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);
