import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type IdentityLogDocument = IdentityLog & Document;

@Schema({ timestamps: true })
export class IdentityLog {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ required: true })
    date: string; // YYYY-MM-DD

    @Prop({ required: true })
    month: number; // The Identity Month currently traversing (1-12)

    @Prop([String])
    completedItems: string[]; // List of strings checked off

    @Prop({ default: 0 })
    completionPercentage: number;
}

export const IdentityLogSchema = SchemaFactory.createForClass(IdentityLog);
IdentityLogSchema.index({ user: 1, date: 1 }, { unique: true });
