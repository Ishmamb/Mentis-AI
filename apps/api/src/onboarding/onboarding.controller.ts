import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}
  @Post() complete(@CurrentUser() user: { sub: string }, @Body() dto: CompleteOnboardingDto) { return this.service.complete(user.sub, dto); }
  @Get() get(@CurrentUser() user: { sub: string }) { return this.service.get(user.sub); }
}
