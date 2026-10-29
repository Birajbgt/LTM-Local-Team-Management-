import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { PlayerRole, UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PlayersService } from './players.service';

class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Aiden Brooks' })
  name: string;

  @IsEnum(PlayerRole)
  @ApiProperty({ enum: PlayerRole, example: PlayerRole.BATSMAN })
  role: PlayerRole;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 250000 })
  basePrice: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 18 })
  matchesPlayed: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 412 })
  totalRuns: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 14 })
  totalWickets: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Aiden', required: false })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Brooks', required: false })
  lastName?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ example: 10, required: false })
  jerseyNumber?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Right-hand bat', required: false })
  battingStyle?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Right-arm medium', required: false })
  bowlingStyle?: string;

  @IsEmail()
  @ApiProperty({ example: 'player@ltm.local' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'team-123', required: false })
  teamId?: string;
}

class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Aiden Brooks', required: false })
  name?: string;

  @IsOptional()
  @IsEnum(PlayerRole)
  @ApiProperty({ enum: PlayerRole, example: PlayerRole.BATSMAN, required: false })
  role?: PlayerRole;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 250000, required: false })
  basePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 18, required: false })
  matchesPlayed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 412, required: false })
  totalRuns?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({ example: 14, required: false })
  totalWickets?: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ example: 9, required: false })
  jerseyNumber?: number;
}

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all players' })
  async findAll() {
    return this.playersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLAYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current player profile and stats' })
  async me(@CurrentUser() user: { id: string }) {
    return this.playersService.findByUserId(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a player profile' })
  @ApiResponse({ status: 201, description: 'Player created successfully.' })
  async create(@Body() body: CreatePlayerDto) {
    return this.playersService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a player' })
  async update(@Param('id') id: string, @Body() body: UpdatePlayerDto) {
    return this.playersService.update(id, body);
  }
}
