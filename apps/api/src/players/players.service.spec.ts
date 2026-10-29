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
      },
      player: {
        findUnique: jest.fn(),
        create: jest.fn(),
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
});
