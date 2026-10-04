import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CompleteGameDto } from './dto/complete-game.dto';
import { ContentService } from './content.service';

@ApiTags('content')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly service: ContentService) {}
  @Get('games') games() { return this.service.games(); }
  @Post('games/:id/complete') complete(@CurrentUser() u: { sub: string }, @Param('id') id: string, @Body() dto: CompleteGameDto) { return this.service.completeGame(u.sub, id, dto); }
  @Get('offline-packs') packs() { return this.service.offlinePacks(); }
  @Post('offline-packs/:id/download') download(@CurrentUser() u: { sub: string }, @Param('id') id: string) { return this.service.downloadPack(u.sub, id); }
  @Get('audio') audio() { return this.service.audio(); }
  @Post('audio/:id/favorite') favorite(@CurrentUser() u: { sub: string }, @Param('id') id: string) { return this.service.toggleFavorite(u.sub, id); }
}
