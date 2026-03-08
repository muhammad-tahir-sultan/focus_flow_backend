import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LifeSystem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD format

  // Morning
  @Prop({ default: false }) fajrPrayer: boolean;
  @Prop({ default: false }) reflectionJournaling: boolean;
  @Prop({ default: false }) exercise30m: boolean;
  @Prop({ default: false }) deepWork4h: boolean;

  // Day
  @Prop({ default: false }) skillBusinessWork: boolean;
  @Prop({ default: false }) networking: boolean;
  @Prop({ default: false }) learning: boolean;

  // Night
  @Prop({ default: false }) nightReflection: boolean;
  @Prop({ default: false }) planningTomorrow: boolean;

  // Character & Self-Control
  @Prop({ default: false }) stayedCalm: boolean;
  @Prop({ default: false }) honesty: boolean;
  @Prop({ default: false }) controlledDesires: boolean;
  @Prop({ default: false }) goodCommunication: boolean;

  @Prop({ default: '' }) notes: string;

  // Weekly Audit Data
  @Prop({ default: false }) weeklyImprovedCharacter: boolean;
  @Prop({ default: false }) weeklyWorkedOnSkills: boolean;
  @Prop({ default: false }) weeklyControlledEmotions: boolean;
  @Prop({ default: false }) weeklyMovedCloserToFinance: boolean;
  @Prop({ default: false }) weeklyStayedDisciplined: boolean;
}

export const LifeSystemSchema = SchemaFactory.createForClass(LifeSystem);
LifeSystemSchema.index({ userId: 1, date: 1 }, { unique: true });
