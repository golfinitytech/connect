import {
  Body,
  Controller,
  Get,
  BadRequestException,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { AdminTokenGuard } from './admin-token.guard';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UploadFacePhotoDto } from './dto/upload-face-photo.dto';
import type { Response } from 'express';

@Controller('admin')
@UseGuards(AdminTokenGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

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

    try {
      await fs.stat(user.facePhotoPath);
    } catch {
      throw new NotFoundException('Face photo not found');
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(user.facePhotoPath);
  }

  @Post('users/:id/face-photo')
  async uploadFacePhoto(
    @Param('id') id: string,
    @Body() body: UploadFacePhotoDto,
  ) {
    const raw = body.imageBase64.trim();
    const match = raw.match(/^data:(image\/(jpeg|jpg|png));base64,(.+)$/i);
    const base64 = match ? match[3] : raw;
    const mime = match ? match[1].toLowerCase() : 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : 'jpg';

    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length) {
      throw new BadRequestException('Invalid image');
    }
    if (buffer.length > 2_500_000) {
      throw new BadRequestException('Image too large');
    }

    const uploadRoot =
      process.env.FACE_UPLOAD_DIR ??
      path.join(process.cwd(), 'apps', 'api', 'uploads', 'faces');
    await fs.mkdir(uploadRoot, { recursive: true });

    const fileName = `${id}-${Date.now()}.${ext}`;
    const fullPath = path.join(uploadRoot, fileName);
    await fs.writeFile(fullPath, buffer);

    await this.prisma.user.update({
      where: { id },
      data: {
        facePhotoPath: fullPath,
        facePhotoUpdatedAt: new Date(),
      },
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
