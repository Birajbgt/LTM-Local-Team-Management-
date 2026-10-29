import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { team: true, user: true, playerStats: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found.');
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
    const normalizedEmail = data.email.trim().toLowerCase();
    const nameParts = data.name.trim().split(/\s+/);
    const derivedFirstName = data.firstName ?? nameParts[0] ?? data.name.trim();
    const derivedLastName =
      data.lastName ?? (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null);

    let existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existingUser) {
      const passwordHash = await bcrypt.hash('player123', 10);
      existingUser = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          password: passwordHash,
          name: data.name,
          role: UserRole.PLAYER,
        },
      });
    }

    if (existingUser.role !== UserRole.PLAYER) {
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
        firstName: derivedFirstName,
        lastName: derivedLastName,
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
      firstName?: string;
      lastName?: string;
      jerseyNumber?: number;
      battingStyle?: string;
      bowlingStyle?: string;
      teamId?: string | null;
    },
  ) {
    const player = await this.prisma.player.findUnique({ where: { id } });

    if (!player) {
      throw new NotFoundException('Player not found.');
    }

    const nameParts = data.name?.trim().split(/\s+/) ?? [];
    const derivedFirstName = data.firstName ?? nameParts[0] ?? undefined;
    const derivedLastName =
      data.lastName ?? (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null);

    return this.prisma.player.update({
      where: { id },
      data: {
        ...data,
        ...(data.name && !data.firstName && !data.lastName
          ? {
              firstName: derivedFirstName,
              lastName: derivedLastName,
            }
          : {}),
      },
      include: { team: true, user: true },
    });
  }
}
