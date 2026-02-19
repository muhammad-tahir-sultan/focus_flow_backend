import { Body, Controller, Post, Get, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Request() req) {
        // Initiates the Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Request() req, @Res() res: Response) {
        const { accessToken, refreshToken } = await this.authService.generateAndSaveTokens(req.user);

        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
        const frontendUrl = isProduction
            ? this.configService.get<string>('FRONTEND_URL_PRODUCTION')
            : this.configService.get<string>('FRONTEND_URL_DEVELOPMENT');

        res.redirect(`${frontendUrl || 'http://localhost:5173'}?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Request() req) {
        return req.user;
    }

    @Post('refresh')
    refresh(@Body() refreshDto: RefreshDto) {
        return this.authService.refreshTokens(refreshDto.refreshToken);
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    logout(@Request() req) {
        this.authService.logout(req.user._id);
        return { message: 'Logged out successfully' };
    }
}
