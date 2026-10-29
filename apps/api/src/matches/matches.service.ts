import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(data: {
    title: string;
    homeTeamId: string;
    awayTeamId: string;
    venue: string;
    scheduledAt: string;
  }) {
    if (data.homeTeamId === data.awayTeamId) {
      throw new Error('A team cannot play against itself.');
    }

    return this.prisma.match.create({
      data: {
        title: data.title,
        venue: data.venue,
        scheduledAt: new Date(data.scheduledAt),
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
      },
      include: { homeTeam: true, awayTeam: true },
    });
  }

  async updateStatus(id: string, status: MatchStatus) {
    const match = await this.prisma.match.findUnique({ where: { id } });

    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    return this.prisma.match.update({
      where: { id },
      data: { status },
      include: { homeTeam: true, awayTeam: true },
    });
  }
}
