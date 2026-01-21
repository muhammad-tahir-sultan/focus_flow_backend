import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
        const { name, email, password, role } = registerDto;

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const user = new this.userModel({
            name,
            email,
            passwordHash: password,
            role: role || 'user', // Default to 'user' if not provided
        });

        await user.save();
        return this.generateAndSaveTokens(user);
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        return this.generateAndSaveTokens(user);
    }

    async logout(userId: string) {
        return this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    }

    async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const userId = await this.verifyRefreshToken(refreshToken);
        const user = await this.userModel.findById(userId);

        if (!user || !user.refreshToken) {
            throw new ForbiddenException('Access Denied');
        }

        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!refreshTokenMatches) {
            throw new ForbiddenException('Access Denied');
        }

        return this.generateAndSaveTokens(user);
    }

    private async validateUser(email: string, pass: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    private async verifyRefreshToken(token: string): Promise<string> {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
            return payload.sub;
        } catch {
            throw new ForbiddenException('Invalid Refresh Token');
        }
    }

    private async generateAndSaveTokens(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
        const tokens = await this.generateTokens(user._id.toString(), user.name, user.email, user.role);
        await this.updateUserRefreshToken(user._id.toString(), tokens.refreshToken);
        return tokens;
    }

    private async updateUserRefreshToken(userId: string, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: hash });
    }

    private async generateTokens(userId: string, name: string, email: string, role: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, id: userId, name, email, role },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '15m',
                },
            ),
            this.jwtService.signAsync(
                { sub: userId, id: userId, name, email, role },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: '7d',
                },
            ),
        ]);

        return { accessToken, refreshToken };
    }
}
