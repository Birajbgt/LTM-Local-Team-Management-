jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import { PlayerRole, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PlayersService } from './players.service';

describe('PlayersService', () => {
  let prisma: any;
  let service: PlayersService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      player: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new PlayersService(prisma);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-default-password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a player user automatically when the player account does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-123',
      email: 'player@test.com',
      name: 'Rahul Sharma',
      role: UserRole.PLAYER,
    });
    prisma.player.findUnique.mockResolvedValue(null);
    prisma.player.create.mockResolvedValue({
      id: 'player-123',
      name: 'Rahul Sharma',
      userId: 'user-123',
      role: PlayerRole.BATSMAN,
    });

    const result = await service.create({
      name: 'Rahul Sharma',
      role: PlayerRole.BATSMAN,
      basePrice: 200000,
      matchesPlayed: 12,
      totalRuns: 420,
      totalWickets: 0,
      email: 'player@test.com',
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'player@test.com',
          name: 'Rahul Sharma',
          role: UserRole.PLAYER,
        }),
      }),
    );
    expect(bcrypt.hash).toHaveBeenCalledWith('player123', 10);
    expect(prisma.player.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Rahul Sharma',
          userId: 'user-123',
        }),
      }),
    );
    expect(result.id).toBe('player-123');
  });

  it('rejects negative numeric stats when updating a player', async () => {
    prisma.player.findUnique.mockResolvedValue({
      id: 'player-123',
      userId: 'user-123',
      user: { email: 'player@test.com' },
    });

    await expect(
      service.update('player-123', {
        basePrice: -500,
        matchesPlayed: -1,
        totalRuns: -10,
        totalWickets: -2,
      }),
    ).rejects.toThrow('Player numeric fields cannot be negative.');
  });

  it('updates the related user and team relation when saving player details', async () => {
    prisma.player.findUnique.mockResolvedValue({
      id: 'player-123',
      userId: 'user-123',
      user: { email: 'old@test.com' },
    });
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.update.mockResolvedValue({ id: 'user-123', email: 'new@test.com' });
    prisma.player.update.mockResolvedValue({
      id: 'player-123',
      name: 'New Name',
      team: { id: 'team-456' },
      user: { id: 'user-123', email: 'new@test.com' },
    });

    await expect(
      service.update('player-123', {
        name: 'New Name',
        email: 'new@test.com',
        role: PlayerRole.BATSMAN,
        basePrice: 2500,
        matchesPlayed: 30,
        totalRuns: 400,
        totalWickets: 10,
        teamId: 'team-456',
      }),
    ).resolves.toMatchObject({ id: 'player-123' });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-123' },
        data: expect.objectContaining({ email: 'new@test.com', name: 'New Name' }),
      }),
    );
    expect(prisma.player.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          team: { connect: { id: 'team-456' } },
        }),
      }),
    );
  });
});
