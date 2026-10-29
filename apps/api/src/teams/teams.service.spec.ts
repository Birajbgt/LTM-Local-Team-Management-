jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let prisma: any;
  let service: TeamsService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      team: {
        create: jest.fn(),
      },
    };

    service = new TeamsService(prisma);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-team-password');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a default team user with the required password when a team is created', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.team.create.mockResolvedValue({
      id: 'team-456',
      name: 'Mumbai Indians',
    });
    prisma.user.create.mockResolvedValue({
      id: 'user-456',
      email: 'mumbai-indians@ltm.local',
      name: 'Mumbai Indians',
      role: UserRole.TEAM,
      teamId: 'team-456',
    });

    const result = await service.create('Mumbai Indians');

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'mumbai-indians@ltm.local',
          name: 'Mumbai Indians',
          role: UserRole.TEAM,
          teamId: 'team-456',
        }),
      }),
    );
    expect(bcrypt.hash).toHaveBeenCalledWith('team123', 10);
    expect(result.id).toBe('team-456');
  });
});
