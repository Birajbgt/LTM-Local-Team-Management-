import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'admin@ltm.local' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'admin123' })
  password: string;
}

class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Nadia Cruz' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'coach@ltm.local' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'securepass123' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  @Type(() => String)
  @ApiProperty({
    enum: UserRole,
    example: UserRole.PLAYER,
    required: false,
  })
  role?: UserRole;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered and token returned.' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login to receive a JWT token' })
  @ApiResponse({ status: 200, description: 'JWT access token and user payload.' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM, UserRole.PLAYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async me(@CurrentUser() user: { id: string; email: string; name: string; role: UserRole }) {
    return user;
  }
}
