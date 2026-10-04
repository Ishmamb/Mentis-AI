import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CommunityService } from './community.service';

@ApiTags('community')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly service: CommunityService) {}
  @Get('leaderboard') leaderboard() { return this.service.leaderboard(); }
  @Get('challenges') challenges() { return this.service.challenges(); }
  @Post('challenges/:id/join') join(@CurrentUser() u: { sub: string }, @Param('id') id: string) { return this.service.join(u.sub, id); }
  @Get('rewards') rewards(@CurrentUser() u: { sub: string }) { return this.service.rewards(u.sub); }
}
