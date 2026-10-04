import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommunityModule } from './community/community.module';
import { ContentModule } from './content/content.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FocusModule } from './focus/focus.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { PrismaModule } from './prisma/prisma.module';
import { WellnessModule } from './wellness/wellness.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OnboardingModule,
    AiModule,
    DashboardModule,
    FocusModule,
    WellnessModule,
    ContentModule,
    CommunityModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
