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
import { MatchStatus, UserRole } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MatchesService } from './matches.service';

class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Cup Semi Final' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'team-1' })
  homeTeamId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'team-2' })
  awayTeamId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Stadium 1' })
  venue: string;

  @IsDateString()
  @ApiProperty({ example: '2026-11-05T18:00:00.000Z' })
  scheduledAt: string;
}

class UpdateMatchStatusDto {
  @IsEnum(MatchStatus)
  @ApiProperty({ enum: MatchStatus, example: MatchStatus.LIVE })
  status: MatchStatus;
}

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM, UserRole.PLAYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all matches' })
  async findAll() {
    return this.matchesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new match' })
  @ApiResponse({ status: 201, description: 'Match created successfully.' })
  async create(@Body() body: CreateMatchDto) {
    return this.matchesService.create(body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update match status' })
  async updateStatus(@Param('id') id: string, @Body() body: UpdateMatchStatusDto) {
    return this.matchesService.updateStatus(id, body.status);
  }
}
