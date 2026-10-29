import { UserRole } from '@prisma/client';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
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
});
