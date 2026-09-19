import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search } },
              { memberId: { contains: search } },
            ],
          }
        : undefined,
      orderBy: {
        fullName: 'asc',
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByMemberId(memberId: string) {
    return this.prisma.user.findUnique({ where: { memberId } });
  }

  async create(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async me(userId: string) {
    return this.findById(userId);
  }

  async getPreferences(userId: string) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
      },
    });
  }

  async updatePreferences(
    userId: string,
    data: {
      notificationsEnabled?: boolean;
      marketingEmails?: boolean;
      privacyMode?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
    },
  ) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        notificationsEnabled: data.notificationsEnabled ?? true,
        marketingEmails: data.marketingEmails ?? false,
        privacyMode: data.privacyMode ?? 'MEMBERS_ONLY',
      },
    });
  }

  async updatePassword(userId: string, passwordHashed: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: passwordHashed },
    });
  }
}
