import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService, private readonly prisma: PrismaService) {}
  @Get('daily-insight') daily(@CurrentUser() user: { sub: string }) { return this.ai.getDailyInsight(user.sub); }
  @Post('daily-insight/:id/complete') async complete(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    await this.prisma.dailyInsight.updateMany({ where: { id, userId: user.sub }, data: { completed: true } });
    return { ok: true };
  }
  @Get('weekly-reflection') weekly(@CurrentUser() user: { sub: string }) { return this.ai.weeklyReflection(user.sub); }
}
