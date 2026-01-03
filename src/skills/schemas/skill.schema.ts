import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type SkillDocument = Skill & Document;

@Schema({ timestamps: true })
export class Skill {
    @Prop({ required: true })
    skillName: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    duration: string;

    @Prop({ required: true, enum: ['Technical', 'Soft Skill', 'Language', 'Other'] })
    category: string;

    @Prop()
    notes: string;

    @Prop({ required: true, min: 1, max: 10 })
    masteryLevel: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
