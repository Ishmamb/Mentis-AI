import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { FinishFocusDto } from './dto/finish-focus.dto';
import { StartFocusDto } from './dto/start-focus.dto';
import { FocusService } from './focus.service';

@ApiTags('focus')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('focus')
export class FocusController {
  constructor(private readonly service: FocusService) {}
  @Post('sessions') start(@CurrentUser() u: { sub: string }, @Body() dto: StartFocusDto) { return this.service.start(u.sub, dto); }
  @Patch('sessions/:id') finish(@CurrentUser() u: { sub: string }, @Param('id') id: string, @Body() dto: FinishFocusDto) { return this.service.finish(u.sub, id, dto); }
  @Get('history') history(@CurrentUser() u: { sub: string }) { return this.service.history(u.sub); }
}
