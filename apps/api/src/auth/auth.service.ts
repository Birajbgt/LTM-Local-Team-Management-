import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

export type AuthUserPayload = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    } satisfies AuthUserPayload;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      accessToken: token,
      user,
    };
  }

  async ensureDefaultAdmin() {
    const email = (process.env.ADMIN_EMAIL ?? 'admin@ltm.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD ?? 'admin123';
    const name = process.env.ADMIN_NAME?.trim() || 'System Admin';

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.role !== UserRole.ADMIN) {
        return this.prisma.user.update({
          where: { id: existing.id },
          data: { role: UserRole.ADMIN, name },
        });
      }

      return existing;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role: UserRole.ADMIN,
      },
    });
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        name: data.name,
        role: data.role ?? UserRole.PLAYER,
      },
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
