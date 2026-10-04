import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteGameDto } from './dto/complete-game.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  games() { return this.prisma.game.findMany({ where: { active: true }, orderBy: { title: 'asc' } }); }

  async completeGame(userId: string, gameId: string, dto: CompleteGameDto) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException('Game not found');
    const session = await this.prisma.gameSession.create({
      data: { userId, gameId, score: dto.score, durationSec: dto.durationSec, xpEarned: game.xpReward },
    });
    await this.prisma.$transaction([
      this.prisma.xPEvent.create({ data: { userId, type: 'GAME_COMPLETED', points: game.xpReward, refId: session.id } }),
      this.prisma.activityEvent.create({ data: { userId, type: 'GAME_COMPLETED', metadata: { game: game.slug, score: dto.score } } }),
    ]);
    return session;
  }

  offlinePacks() { return this.prisma.offlinePack.findMany({ orderBy: [{ tier: 'asc' }, { title: 'asc' }] }); }

  async downloadPack(userId: string, packId: string) {
    const pack = await this.prisma.offlinePack.findUnique({ where: { id: packId } });
    if (!pack) throw new NotFoundException('Pack not found');
    const download = await this.prisma.offlineDownload.create({ data: { userId, packId } });
    await this.prisma.activityEvent.create({ data: { userId, type: 'PACK_DOWNLOADED', metadata: { pack: pack.slug } } });
    return { downloadId: download.id, pdfUrl: pack.pdfUrl, tier: pack.tier };
  }

  audio() { return this.prisma.audioTrack.findMany({ orderBy: { title: 'asc' } }); }

  async toggleFavorite(userId: string, trackId: string) {
    const existing = await this.prisma.audioFavorite.findUnique({ where: { userId_trackId: { userId, trackId } } });
    if (existing) {
      await this.prisma.audioFavorite.delete({ where: { id: existing.id } });
      return { favorite: false };
    }
    await this.prisma.audioFavorite.create({ data: { userId, trackId } });
    return { favorite: true };
  }
}
