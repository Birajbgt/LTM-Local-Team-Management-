import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.team.findMany({
      include: { players: true, users: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: { players: true, users: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found.');
    }

    return team;
  }

  async create(name: string) {
    const teamName = name.trim();
    const team = await this.prisma.team.create({
      data: { name: teamName },
      include: { players: true },
    });

    const teamSlug = team.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'team';
    const defaultEmail = `${teamSlug}@ltm.local`;
    const passwordHash = await bcrypt.hash('team123', 10);

    await this.prisma.user.create({
      data: {
        email: defaultEmail,
        password: passwordHash,
        name: team.name,
        role: UserRole.TEAM,
        teamId: team.id,
      },
    });

    return team;
  }

  async update(id: string, data: { name?: string }) {
    const team = await this.prisma.team.findUnique({ where: { id } });

    if (!team) {
      throw new NotFoundException('Team not found.');
    }

    return this.prisma.team.update({
      where: { id },
      data,
      include: { players: true },
    });
  }
}
