import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

let cachedServer: any;

async function bootstrapServer() {
    if (!cachedServer) {
        const expressApp = express();
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(expressApp),
        );
        app.enableCors({
            origin: ['https://focus-flow-tracker.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
            allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
        });
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        cachedServer = expressApp;
    }
    return cachedServer;
}

export default async (req: any, res: any) => {
    const server = await bootstrapServer();
    server(req, res);
};
