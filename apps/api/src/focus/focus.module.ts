import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FocusController } from './focus.controller';
import { FocusService } from './focus.service';

@Module({ imports: [AuthModule], controllers: [FocusController], providers: [FocusService] })
export class FocusModule {}
