import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { FaceStorageService } from '../storage/face-storage.service';
import { AdminTokenGuard } from './admin-token.guard';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UploadFacePhotoDto } from './dto/upload-face-photo.dto';
import type { Response } from 'express';

@Controller('admin')
@UseGuards(AdminTokenGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly faceStorage: FaceStorageService,
  ) {}

  @Get('users')
  async listUsers(@Query('limit') limitRaw?: string) {
    const limit = Math.min(Math.max(Number(limitRaw ?? 200) || 200, 1), 1000);

    const users = await this.prisma.user.findMany({
      where: {
        lastLoginAt: { not: null },
      },
      orderBy: { lastLoginAt: 'desc' },
      take: limit,
      select: {
        id: true,
        email: true,
        fullName: true,
        memberId: true,
        handicapIndex: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        lastSeenAt: true,
        lastSeenLat: true,
        lastSeenLng: true,
        facePhotoUpdatedAt: true,
      },
    });

    return { users };
  }

  @Get('users/:id/face-photo')
  async getFacePhoto(@Param('id') id: string, @Res() res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { facePhotoPath: true, facePhotoUpdatedAt: true },
    });
    if (!user?.facePhotoPath) {
      throw new NotFoundException('Face photo not found');
    }

    const { buffer, contentType } = await this.faceStorage.download(
      user.facePhotoPath,
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(buffer);
  }

  @Post('users/:id/face-photo')
  async uploadFacePhoto(
    @Param('id') id: string,
    @Body() body: UploadFacePhotoDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { facePhotoPath: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const key = await this.faceStorage.saveFace(
      id,
      body.imageBase64,
      user.facePhotoPath,
    );
    await this.prisma.user.update({
      where: { id },
      data: { facePhotoPath: key, facePhotoUpdatedAt: new Date() },
    });

    return { ok: true };
  }

  @Post('users/:id/password')
  async updateUserPassword(
    @Param('id') id: string,
    @Body() body: UpdateUserPasswordDto,
  ) {
    const passwordHashed = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: passwordHashed },
    });
    return { ok: true };
  }
}
