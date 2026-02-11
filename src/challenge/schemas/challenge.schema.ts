import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChallengeEntryDocument = ChallengeEntry & Document;

@Schema({ timestamps: true })
export class ChallengeEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: Date; // Store as ISO date string usually, or Date object. Best to store normalized to start of day.

  @Prop({ type: [String], default: [] })
  completedTasks: string[];

  @Prop({ default: false })
  isFullyCompleted: boolean;
}

export const ChallengeEntrySchema = SchemaFactory.createForClass(ChallengeEntry);

// Index for unique entry per user per day
ChallengeEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
