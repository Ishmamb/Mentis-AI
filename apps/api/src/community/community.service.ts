import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async leaderboard() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const grouped = await this.prisma.xPEvent.groupBy({ by: ['userId'], where: { createdAt: { gte: since } }, _sum: { points: true }, orderBy: { _sum: { points: 'desc' } }, take: 10 });
    const users = await this.prisma.user.findMany({ where: { id: { in: grouped.map(x => x.userId) } }, select: { id: true, displayName: true, username: true } });
    const map = new Map(users.map(u => [u.id, u]));
    return grouped.map((row, index) => {
      const u = map.get(row.userId);
      return { rank: index + 1, points: row._sum.points || 0, id: u?.id || row.userId, displayName: u?.displayName || 'Mentis User', username: u?.username || 'unknown' };
    });
  }

  challenges() { return this.prisma.challenge.findMany({ where: { status: 'ACTIVE' }, orderBy: { endsAt: 'asc' } }); }

  async join(userId: string, id: string) {
    if (!(await this.prisma.challenge.findUnique({ where: { id } }))) throw new NotFoundException('Challenge not found');
    return this.prisma.challengeParticipant.upsert({ where: { userId_challengeId: { userId, challengeId: id } }, create: { userId, challengeId: id }, update: {} });
  }

  async rewards(userId: string) {
    const total = await this.prisma.xPEvent.aggregate({ where: { userId }, _sum: { points: true } });
    const xp = total._sum.points || 0;
    const eligible = await this.prisma.collectible.findMany({ where: { unlockXp: { lte: xp } }, orderBy: { unlockXp: 'asc' } });
    for (const collectible of eligible) {
      await this.prisma.userCollectible.upsert({
        where: { userId_collectibleId: { userId, collectibleId: collectible.id } },
        create: { userId, collectibleId: collectible.id },
        update: {},
      });
    }
    const unlocked = await this.prisma.userCollectible.findMany({ where: { userId }, include: { collectible: true }, orderBy: { unlockedAt: 'desc' } });
    const level = xp >= 1200 ? 'Ascendant' : xp >= 600 ? 'Disciplined' : xp >= 200 ? 'Focused' : 'Starter';
    return { xp, level, unlocked };
  }
}
