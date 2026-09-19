import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PrivacyMode } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { PingDto } from './dto/ping.dto';

class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsEnum(PrivacyMode)
  privacyMode?: PrivacyMode;
}

class UpdateUserDto {
  @IsOptional()
  fullName?: string;

  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  fcmToken?: string;

  @IsOptional()
  handicapIndex?: number;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@GetUser('id') userId: string) {
    return this.usersService.me(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@GetUser('id') userId: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/ping')
  async ping(@GetUser('id') userId: string, @Body() body: PingDto) {
    const data: Record<string, unknown> = { lastSeenAt: new Date() };
    if (typeof body.latitude === 'number') data.lastSeenLat = body.latitude;
    if (typeof body.longitude === 'number') data.lastSeenLng = body.longitude;
    await this.usersService.update(userId, data);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/preferences')
  getPreferences(@GetUser('id') userId: string) {
    return this.usersService.getPreferences(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/preferences')
  updatePreferences(
    @GetUser('id') userId: string,
    @Body() body: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(userId, body);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
