import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AdminSetupService implements OnModuleInit {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async onModuleInit() {
        await this.setupAdmin();
    }

    async setupAdmin() {
        const email = 'tahirsultanofficial@gmail.com';
        const user = await this.userModel.findOne({ email });
        if (user) {
            if (user.role !== 'admin') {
                user.role = 'admin';
                await (user as any).save();
                console.log(`User ${email} has been promoted to admin.`);
            } else {
                console.log(`User ${email} is already an admin.`);
            }
        } else {
            console.log(`User ${email} not found in database. Please register first.`);
        }
    }
}
