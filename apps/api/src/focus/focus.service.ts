import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinishFocusDto } from './dto/finish-focus.dto';
import { StartFocusDto } from './dto/start-focus.dto';

@Injectable()
export class FocusService {
  constructor(private readonly prisma: PrismaService) {}

  start(userId: string, dto: StartFocusDto) {
    return this.prisma.focusSession.create({ data: { userId, plannedMinutes: dto.plannedMinutes } });
  }

  async finish(userId: string, id: string, dto: FinishFocusDto) {
    const session = await this.prisma.focusSession.findFirst({ where: { id, userId } });
    if (!session) throw new NotFoundException('Focus session not found');
    const updated = await this.prisma.focusSession.update({
      where: { id },
      data: { status: dto.status, completedMinutes: dto.completedMinutes, endedAt: new Date() },
    });
    if (dto.status === 'COMPLETED') {
      const points = 10 + Math.min(40, Math.floor(dto.completedMinutes / 5) * 5);
      await this.prisma.$transaction([
        this.prisma.xPEvent.create({ data: { userId, type: 'FOCUS_SESSION_COMPLETED', points, refId: id } }),
        this.prisma.activityEvent.create({ data: { userId, type: 'FOCUS_COMPLETED', metadata: { minutes: dto.completedMinutes } } }),
      ]);
    }
    return updated;
  }

  history(userId: string) {
    return this.prisma.focusSession.findMany({ where: { userId }, orderBy: { startedAt: 'desc' }, take: 30 });
  }
}
