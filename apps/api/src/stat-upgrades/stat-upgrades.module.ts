import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { StatUpgradesController } from './stat-upgrades.controller';
import { StatUpgradesService } from './stat-upgrades.service';

@Module({
  imports: [AuthModule],
  controllers: [StatUpgradesController],
  providers: [StatUpgradesService],
  exports: [StatUpgradesService],
})
export class StatUpgradesModule {}
