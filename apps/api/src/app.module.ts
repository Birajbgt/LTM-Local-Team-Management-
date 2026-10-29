import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { MatchesModule } from './matches/matches.module';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';
import { StatUpgradesModule } from './stat-upgrades/stat-upgrades.module';
import { TeamsModule } from './teams/teams.module';

@Injectable()
export class DefaultAdminSeeder implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    await this.authService.ensureDefaultAdmin();
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TeamsModule,
    PlayersModule,
    MatchesModule,
    StatUpgradesModule,
  ],
  controllers: [AppController],
  providers: [AppService, DefaultAdminSeeder],
})
export class AppModule {}
