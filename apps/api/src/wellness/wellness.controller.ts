import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CreateMoodDto } from './dto/create-mood.dto';
import { LogGoalDto } from './dto/log-goal.dto';
import { WellnessService } from './wellness.service';

@ApiTags('wellness')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wellness')
export class WellnessController {
  constructor(private readonly service: WellnessService) {}
  @Post('mood') addMood(@CurrentUser() u: { sub: string }, @Body() dto: CreateMoodDto) { return this.service.addMood(u.sub, dto); }
  @Get('mood') mood(@CurrentUser() u: { sub: string }) { return this.service.moodHistory(u.sub); }
  @Post('goals') createGoal(@CurrentUser() u: { sub: string }, @Body() dto: CreateGoalDto) { return this.service.createGoal(u.sub, dto); }
  @Get('goals') goals(@CurrentUser() u: { sub: string }) { return this.service.goals(u.sub); }
  @Post('goals/:id/log') log(@CurrentUser() u: { sub: string }, @Param('id') id: string, @Body() dto: LogGoalDto) { return this.service.logGoal(u.sub, id, dto); }
}
