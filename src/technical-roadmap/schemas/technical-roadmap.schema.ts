import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TechnicalRoadmapDocument = TechnicalRoadmap & Document;

@Schema()
export class Resource {
    @Prop({ required: true })
    label: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true, enum: ['Docs', 'Course', 'Video', 'Article', 'Book'] })
    type: string;
}

@Schema({ timestamps: true })
export class TechnicalRoadmap {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, unique: true, index: true })
    slug: string;

    @Prop({ required: true })
    summary: string;

    @Prop({ required: true })
    content: string; // Markdown long-form

    @Prop({ required: true })
    whyThisMatters: string;

    @Prop({ type: [String], required: true })
    problemsItSolves: string[];

    @Prop({ type: [String], required: true })
    tradeOffs: string[];

    @Prop({ required: true })
    motivation: string;

    @Prop({ type: [String], required: true })
    learningOutcomes: string[];

    @Prop({ required: true, enum: ['Backend', 'Frontend', 'DevOps', 'System Design', 'AI'] })
    category: string;

    @Prop({ required: true, enum: ['High', 'Medium', 'Low'] })
    priority: string;

    @Prop({ required: true, enum: ['Planned', 'InProgress', 'Completed'] })
    status: string;

    @Prop({ required: true, min: 1, max: 5 })
    difficulty: number;

    @Prop({ type: [Resource], default: [] })
    resources: Resource[];

    @Prop()
    plannedStart: Date;

    @Prop()
    plannedEnd: Date;

    @Prop({ default: false })
    isArchived: boolean;
}

const TechnicalRoadmapSchema = SchemaFactory.createForClass(TechnicalRoadmap);

// Compound Indexes
TechnicalRoadmapSchema.index({ status: 1, priority: 1 });
TechnicalRoadmapSchema.index({ category: 1, createdAt: -1 });

export { TechnicalRoadmapSchema };
