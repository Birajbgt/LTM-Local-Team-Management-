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
import { UpgradeStatus, UserRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatUpgradesService } from './stat-upgrades.service';

class CreateStatUpgradeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'goals' })
  fieldName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2' })
  currentValue: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '5' })
  requestedValue: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'I improved my finishing rate after training camp.' })
  reason: string;
}

class UpdateUpgradeStatusDto {
  @IsEnum(UpgradeStatus)
  @ApiProperty({ enum: UpgradeStatus, example: UpgradeStatus.APPROVED })
  status: UpgradeStatus;
}

@ApiTags('Stat Upgrades')
@Controller('stat-upgrades')
export class StatUpgradesController {
  constructor(private readonly statUpgradesService: StatUpgradesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLAYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a stat upgrade review from admin' })
  @ApiResponse({ status: 201, description: 'Stat upgrade request created.' })
  async create(@CurrentUser() user: { id: string }, @Body() body: CreateStatUpgradeDto) {
    return this.statUpgradesService.create(user.id, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEAM, UserRole.PLAYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List stat upgrade requests' })
  async findAll(@CurrentUser() user: { id: string; role: UserRole }) {
    return this.statUpgradesService.findAllForUser(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject a stat upgrade request' })
  async review(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() body: UpdateUpgradeStatusDto,
  ) {
    return this.statUpgradesService.review(id, user.id, body.status);
  }
}
