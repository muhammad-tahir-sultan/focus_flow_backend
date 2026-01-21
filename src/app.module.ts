import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { GoalsModule } from './goals/goals.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { TechnicalRoadmapModule } from './technical-roadmap/technical-roadmap.module';
import { SkillsModule } from './skills/skills.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomeModule } from './income/income.module';
import { SavingsModule } from './savings/savings.module';
import { LoansModule } from './loans/loans.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    GoalsModule,
    DailyLogsModule,
    RoadmapsModule,
    TechnicalRoadmapModule,
    SkillsModule,
    ExpensesModule,
    IncomeModule,
    SavingsModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
