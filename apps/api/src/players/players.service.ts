import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
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
    profileImageUrl?: string;
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
        profileImageUrl: data.profileImageUrl?.trim() || '/images/default-player.svg',
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
      email?: string;
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
      profileImageUrl?: string;
      teamId?: string | null;
    },
  ) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found.');
    }

    const numericFields = [
      data.basePrice,
      data.matchesPlayed,
      data.totalRuns,
      data.totalWickets,
    ];

    if (numericFields.some((value) => typeof value === 'number' && value < 0)) {
      throw new BadRequestException('Player numeric fields cannot be negative.');
    }

    const normalizedEmail = data.email?.trim().toLowerCase();

    if (normalizedEmail && normalizedEmail !== player.user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser && existingUser.id !== player.userId) {
        throw new BadRequestException('This email is already in use.');
      }
    }

    const nameParts = data.name?.trim().split(/\s+/) ?? [];
    const derivedFirstName = data.firstName ?? nameParts[0] ?? undefined;
    const derivedLastName =
      data.lastName ?? (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null);

    const { teamId, email: _email, ...playerFields } = data;
    const normalizedProfileImageUrl = data.profileImageUrl?.trim() || player.profileImageUrl || '/images/default-player.svg';

    const playerUpdateData: Prisma.PlayerUpdateInput = {
      ...playerFields,
      profileImageUrl: normalizedProfileImageUrl,
      ...(data.name && !data.firstName && !data.lastName
        ? {
            firstName: derivedFirstName,
            lastName: derivedLastName,
          }
        : {}),
      ...(teamId !== undefined
        ? {
            team: teamId ? { connect: { id: teamId } } : { disconnect: true },
          }
        : {}),
    };

    if (normalizedEmail && normalizedEmail !== player.user.email) {
      await this.prisma.user.update({
        where: { id: player.userId },
        data: {
          email: normalizedEmail,
          ...(data.name ? { name: data.name.trim() } : {}),
        },
      });
    }

    return this.prisma.player.update({
      where: { id },
      data: playerUpdateData,
      include: { team: true, user: true },
    });
  }
}
