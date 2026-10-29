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
import { UserRole } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TeamsService } from './teams.service';

class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'River City FC' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/logo/ltm.jpg', required: false })
  logoUrl?: string;
}

class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Harbor United FC', required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/logo/ltm.jpg', required: false })
  logoUrl?: string;
}

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all teams' })
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a team by id' })
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team or club' })
  @ApiResponse({ status: 201, description: 'Team created successfully.' })
  async create(@Body() body: CreateTeamDto) {
    return this.teamsService.create(body.name, body.logoUrl);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a team' })
  async update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
    return this.teamsService.update(id, body);
  }
}
