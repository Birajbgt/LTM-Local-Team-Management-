import { Injectable, NotFoundException } from '@nestjs/common';
import { UpgradeStatus, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatUpgradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: {
    fieldName: string;
    currentValue: string;
    requestedValue: string;
    reason: string;
  }) {
    const player = await this.prisma.player.findUnique({
      where: { userId },
    });

    if (!player) {
      throw new NotFoundException('Player profile not found.');
    }

    return this.prisma.statUpgradeRequest.create({
      data: {
        playerId: player.id,
        requestedById: userId,
        fieldName: data.fieldName,
        currentValue: data.currentValue,
        requestedValue: data.requestedValue,
        reason: data.reason,
      },
      include: { player: true, requestedBy: true },
    });
  }

  async findAllForUser(user: { id: string; role: UserRole }) {
    if (user.role === UserRole.ADMIN) {
      return this.prisma.statUpgradeRequest.findMany({
        include: { player: true, requestedBy: true, reviewedBy: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === UserRole.PLAYER) {
      return this.prisma.statUpgradeRequest.findMany({
        where: { requestedById: user.id },
        include: { player: true, requestedBy: true, reviewedBy: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.statUpgradeRequest.findMany({
      include: { player: true, requestedBy: true, reviewedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async review(id: string, reviewerId: string, status: UpgradeStatus) {
    const request = await this.prisma.statUpgradeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Stat upgrade request not found.');
    }

    return this.prisma.statUpgradeRequest.update({
      where: { id },
      data: {
        reviewedById: reviewerId,
        status,
      },
      include: { player: true, requestedBy: true, reviewedBy: true },
    });
  }
}
