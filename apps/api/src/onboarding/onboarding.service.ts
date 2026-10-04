import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  private makePlan(dto: CompleteOnboardingDto) {
    const heavy = dto.screenTime === '6h+' || dto.screenTime === '4–6h';
    const topApp = dto.apps[0] || 'your most-used app';
    return {
      dailyFocusMinutes: heavy ? 10 : 15,
      dailyChallenges: 2,
      blockedApp: topApp,
      blockedAfter: heavy ? '10:00 PM' : '11:00 PM',
      reason: heavy
        ? 'Start small: protect one high-friction moment, then build consistency.'
        : 'Your baseline is moderate, so we can begin with a slightly longer focus block.',
    };
  }

  async complete(userId: string, dto: CompleteOnboardingDto) {
    await this.prisma.onboardingProfile.upsert({
      where: { userId },
      create: { userId, goals: dto.goals, screenTime: dto.screenTime, apps: dto.apps },
      update: { goals: dto.goals, screenTime: dto.screenTime, apps: dto.apps },
    });
    await this.prisma.assessmentResult.create({
      data: {
        userId,
        correctAnswers: dto.assessmentCorrect,
        focusIndex: dto.focusIndex,
        cognitiveAge: dto.cognitiveAge,
      },
    });
    const planData = this.makePlan(dto);
    const plan = await this.prisma.starterPlan.create({ data: { userId, ...planData } });
    await this.prisma.activityEvent.create({ data: { userId, type: 'ONBOARDING_COMPLETED', metadata: { focusIndex: dto.focusIndex } } });
    return { focusIndex: dto.focusIndex, plan };
  }

  async get(userId: string) {
    const [profile, assessment, plan] = await Promise.all([
      this.prisma.onboardingProfile.findUnique({ where: { userId } }),
      this.prisma.assessmentResult.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.starterPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);
    return { profile, assessment, plan };
  }
}
