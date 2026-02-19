import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        const callbackURL = isProduction
            ? configService.get<string>('GOOGLE_CALLBACK_URL_PRODUCTION')
            : configService.get<string>('GOOGLE_CALLBACK_URL_DEVELOPMENT');

        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'PLACEHOLDER_CLIENT_ID',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'PLACEHOLDER_CLIENT_SECRET',
            callbackURL: callbackURL || 'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            const user = await this.authService.validateGoogleUser(profile);
            done(null, user);
        } catch (error) {
            done(error, false);
        }
    }
}
