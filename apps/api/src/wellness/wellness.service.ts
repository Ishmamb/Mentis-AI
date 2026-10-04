import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateMoodDto } from './dto/create-mood.dto';
import { LogGoalDto } from './dto/log-goal.dto';

@Injectable()
export class WellnessService {
  constructor(private readonly prisma: PrismaService) {}

  async addMood(userId: string, dto: CreateMoodDto) {
    const mood = await this.prisma.moodEntry.create({ data: { userId, ...dto } });
    await this.prisma.$transaction([
      this.prisma.xPEvent.create({ data: { userId, type: 'DAILY_MOOD_CHECKIN', points: 5, refId: mood.id } }),
      this.prisma.activityEvent.create({ data: { userId, type: 'MOOD_CHECKIN', metadata: { mood: dto.mood } } }),
    ]);
    return mood;
  }

  moodHistory(userId: string) {
    return this.prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 });
  }

  createGoal(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: { userId, title: dto.title, category: dto.category, target: dto.target, unit: dto.unit, frequency: dto.frequency, deadline: dto.deadline ? new Date(dto.deadline) : undefined },
    });
  }

  goals(userId: string) {
    return this.prisma.goal.findMany({ where: { userId, status: { not: 'ARCHIVED' } }, include: { logs: { orderBy: { createdAt: 'desc' }, take: 100 } }, orderBy: { createdAt: 'desc' } });
  }

  async logGoal(userId: string, goalId: string, dto: LogGoalDto) {
    const goal = await this.prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    const log = await this.prisma.goalLog.create({ data: { goalId, value: dto.value, note: dto.note } });
    await this.prisma.$transaction([
      this.prisma.xPEvent.create({ data: { userId, type: 'GOAL_PROGRESS', points: 10, refId: goalId } }),
      this.prisma.activityEvent.create({ data: { userId, type: 'GOAL_UPDATED', metadata: { goalId, value: dto.value } } }),
    ]);
    const total = await this.prisma.goalLog.aggregate({ where: { goalId }, _sum: { value: true } });
    if ((total._sum.value || 0) >= goal.target && goal.status !== 'COMPLETED') {
      await this.prisma.goal.update({ where: { id: goalId }, data: { status: 'COMPLETED' } });
      await this.prisma.xPEvent.create({ data: { userId, type: 'GOAL_COMPLETED', points: 40, refId: goalId } });
    }
    return log;
  }
}
