import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;

    // This is the TTL index
    // MongoDB will automatically delete the document when current time > expiresAt
    @Prop({ type: Date, expires: 0, default: Date.now })
    ttlIndex: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Simple approach: Use the expiresAt field directly for TTL
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
