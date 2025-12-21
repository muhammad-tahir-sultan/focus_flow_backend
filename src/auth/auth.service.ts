import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ token: string }> {
        const { name, email, password } = registerDto;

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Password hashing is handled in the schema pre-save hook, 
        // BUT we need to pass it as passwordHash to match the property.
        // Actually, let's handle hashing here explicitly or let the hook do it.
        // The hook expects 'passwordHash' to be modified.
        // Let's just hash it here for clarity and control, or rely on the hook.
        // If I use the hook, I need to set `passwordHash` to the raw password first.
        // Let's just hash here to be safe and remove the hook complexity if needed, 
        // but the hook is already written. Let's use the hook.

        const user = new this.userModel({
            name,
            email,
            passwordHash: password, // The hook will hash this
        });

        await user.save();

        const token = this.jwtService.sign({ id: user._id });
        return { token };
    }

    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({ id: user._id });
        return { token };
    }
}
