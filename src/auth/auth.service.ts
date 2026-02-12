import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
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
            role: role || 'user',
        });

        await user.save();
        return this.generateAndSaveTokens(user);
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        return this.generateAndSaveTokens(user);
    }

    async logout(userId: string) {
        // Remove all refresh tokens for this user on logout
        return this.refreshTokenModel.deleteMany({ userId: new Types.ObjectId(userId) });
    }

    async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        // Find the token in our collection
        const storedToken = await this.refreshTokenModel.findOne({ token: refreshToken });
        if (!storedToken) {
            throw new ForbiddenException('Invalid or expired refresh token');
        }

        const userId = await this.verifyRefreshToken(refreshToken);
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        // Remove the old token after it's been used (rotating refresh tokens)
        await this.refreshTokenModel.deleteOne({ _id: storedToken._id });

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

        // Calculate expiration for TTL (matching JWT expiration)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Save the new refresh token to the collection
        await this.refreshTokenModel.create({
            userId: user._id,
            token: tokens.refreshToken,
            expiresAt: expiresAt
        });

        return tokens;
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
