import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
