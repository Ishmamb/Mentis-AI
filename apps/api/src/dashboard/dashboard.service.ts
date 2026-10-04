import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly ai: AiService) {}

  private levelForXp(xp: number) {
    if (xp >= 1200) return { name: 'Ascendant', level: 4, nextAt: null };
    if (xp >= 600) return { name: 'Disciplined', level: 3, nextAt: 1200 };
    if (xp >= 200) return { name: 'Focused', level: 2, nextAt: 600 };
    return { name: 'Starter', level: 1, nextAt: 200 };
  }

  async get(userId: string) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [user, assessment, plan, sessions, xp, activeGoal, insight] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true, displayName: true, username: true } }),
      this.prisma.assessmentResult.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.starterPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.focusSession.findMany({ where: { userId, startedAt: { gte: since } }, orderBy: { startedAt: 'desc' } }),
      this.prisma.xPEvent.aggregate({ where: { userId }, _sum: { points: true } }),
      this.prisma.goal.findFirst({ where: { userId, status: 'ACTIVE' }, include: { logs: { orderBy: { createdAt: 'desc' }, take: 20 } }, orderBy: { createdAt: 'desc' } }),
      this.ai.getDailyInsight(userId),
    ]);
    const completed = sessions.filter(s => s.status === 'COMPLETED');
    const focusedMinutes = completed.reduce((sum, s) => sum + s.completedMinutes, 0);
    const totalXp = xp._sum.points || 0;
    const level = this.levelForXp(totalXp);
    const goalProgress = activeGoal ? activeGoal.logs.reduce((sum, x) => sum + x.value, 0) : 0;
    return {
      user,
      focusIndex: assessment?.focusIndex ?? 62,
      streak: Math.min(12, completed.length),
      dailyInsight: insight,
      todayPlan: [
        { id: 'focus', title: 'Focus reset', meta: `${plan?.dailyFocusMinutes || 15} min`, done: false },
        { id: 'train', title: 'Cognitive challenge', meta: '2–5 min', done: false },
        { id: 'shield', title: `Shield ${plan?.blockedApp || 'a distracting app'}`, meta: `after ${plan?.blockedAfter || '10:00 PM'}`, done: false },
      ],
      weekly: { completedSessions: completed.length, focusedMinutes },
      level: { ...level, xp: totalXp },
      activeGoal: activeGoal ? { id: activeGoal.id, title: activeGoal.title, target: activeGoal.target, unit: activeGoal.unit, progress: goalProgress } : null,
      plan,
    };
  }
}
