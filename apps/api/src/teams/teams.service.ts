import { Injectable, NotFoundException } from '@nestjs/common';

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

  async create(name: string) {
    return this.prisma.team.create({
      data: { name },
      include: { players: true },
    });
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
