import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChallengeEntryDocument = ChallengeEntry & Document;

@Schema({ _id: false })
class TaskLog {
  @Prop({ required: true })
  taskCode: string;

  @Prop({ default: '' })
  value: string; // e.g., "100" or "10 sets"

  @Prop({ default: '' })
  note: string; // e.g., "Did 3 sets of 30, 20, 20..."

  @Prop({ default: false })
  completed: boolean;
}

@Schema({ timestamps: true })
export class ChallengeEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: [TaskLog], default: [] })
  taskLogs: TaskLog[];

  @Prop({ default: false })
  isFullyCompleted: boolean;
}

export const ChallengeEntrySchema = SchemaFactory.createForClass(ChallengeEntry);

ChallengeEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
