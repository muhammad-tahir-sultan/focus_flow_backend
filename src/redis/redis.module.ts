import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async () => {
                const client = createClient({
                    username: 'default',
                    password: '5jSv2ryxlLlOlaABAz34EUnKHDUjJRKu',
                    socket: {
                        host: 'redis-15536.c265.us-east-1-2.ec2.cloud.redislabs.com',
                        port: 15536
                    }
                });

                client.on('error', err => console.log('Redis Client Error', err));

                await client.connect();
                console.log('Redis Connected Successfully');
                return client;
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule { }
