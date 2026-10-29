import { UserRole } from '@prisma/client';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_EMAIL = 'admin@ltm.com';
    process.env.ADMIN_PASSWORD = 'admin123';
    process.env.ADMIN_NAME = 'System Admin';
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_NAME;
  });

  it('creates the default admin when one does not already exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ltm.com',
      name: 'System Admin',
      role: UserRole.ADMIN,
      password: 'hashed-password',
      teamId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = new AuthService(prisma as any, jwtService as any);

    const user = await service.ensureDefaultAdmin();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@ltm.com' },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'admin@ltm.com',
          name: 'System Admin',
          role: UserRole.ADMIN,
        }),
      }),
    );
    expect(user.email).toBe('admin@ltm.com');
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it('updates the user email and hashes a new password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'old@ltm.com',
      name: 'Player One',
      role: UserRole.PLAYER,
      password: 'existing-hash',
    });

    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'new@ltm.com',
      name: 'Player One',
      role: UserRole.PLAYER,
      password: 'hashed-new-password',
    });

    jwtService.signAsync.mockResolvedValue('fresh-token');

    const service = new AuthService(prisma as any, jwtService as any);

    const result = await service.updateProfile('user-1', {
      email: 'new@ltm.com',
      password: 'newpass123',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          email: 'new@ltm.com',
          password: expect.any(String),
        }),
      }),
    );
    expect(prisma.user.update.mock.calls[0][0].data.password).not.toBe('newpass123');
    expect(result.accessToken).toBe('fresh-token');
    expect(result.user.email).toBe('new@ltm.com');
  });
});
