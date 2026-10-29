import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.player.findMany({
      include: { team: true, user: true, playerStats: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    const player = await this.prisma.player.findUnique({
      where: { userId },
      include: { team: true, playerStats: true },
    });

    if (!player) {
      throw new NotFoundException('Player profile not found.');
    }

    return player;
  }

  async create(data: {
    name: string;
    role: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
    basePrice: number;
    matchesPlayed: number;
    totalRuns: number;
    totalWickets: number;
    firstName?: string;
    lastName?: string;
    jerseyNumber?: number;
    battingStyle?: string;
    bowlingStyle?: string;
    email: string;
    teamId?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!existingUser) {
      throw new BadRequestException(
        'User not found. Register the account before creating a player profile.',
      );
    }

    if (existingUser.role !== 'PLAYER') {
      throw new BadRequestException('This user is not a player role.');
    }

    const existingPlayer = await this.prisma.player.findUnique({
      where: { userId: existingUser.id },
    });

    if (existingPlayer) {
      throw new BadRequestException('A player profile already exists for this account.');
    }

    return this.prisma.player.create({
      data: {
        name: data.name,
        role: data.role,
        basePrice: data.basePrice,
        matchesPlayed: data.matchesPlayed,
        totalRuns: data.totalRuns,
        totalWickets: data.totalWickets,
        firstName: data.firstName ?? data.name.split(' ')[0] ?? data.name,
        lastName: data.lastName ?? data.name.split(' ').slice(1).join(' ') || null,
        jerseyNumber: data.jerseyNumber,
        battingStyle: data.battingStyle,
        bowlingStyle: data.bowlingStyle,
        teamId: data.teamId,
        userId: existingUser.id,
      },
      include: { team: true, user: true },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      role?: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
      basePrice?: number;
      matchesPlayed?: number;
      totalRuns?: number;
      totalWickets?: number;
      jerseyNumber?: number;
    },
  ) {
    const player = await this.prisma.player.findUnique({ where: { id } });

    if (!player) {
      throw new NotFoundException('Player not found.');
    }

    return this.prisma.player.update({
      where: { id },
      data: {
        ...data,
        ...(data.name && !data.firstName && !data.lastName
          ? {
              firstName: data.name.split(' ')[0] ?? data.name,
              lastName: data.name.split(' ').slice(1).join(' ') || null,
            }
          : {}),
      },
      include: { team: true, user: true },
    });
  }
}
