import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
    role: string;

    @Prop({ required: false })
    refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash password
UserSchema.pre('save', async function () {
    const user = this as UserDocument;
    if (!user.isModified('passwordHash')) return;
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
});
