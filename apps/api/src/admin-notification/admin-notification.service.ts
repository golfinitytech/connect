import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminNotificationService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AdminNotificationCreateInput) {
    return this.prisma.adminNotification.create({
      data,
    });
  }

  async getLatest() {
    return this.prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async updateApproval(
    changedHole: number,
    changedPlayerName: string,
    isApproved: boolean,
  ) {
    // Find the latest notification matching this
    const latest = await this.prisma.adminNotification.findFirst({
      where: {
        changedHole,
        changedPlayerName,
        isApproved: false,
        isMarshalEdit: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      return this.prisma.adminNotification.update({
        where: { id: latest.id },
        data: { isApproved },
      });
    }
    return null;
  }

  async markAllAsRead() {
    return this.prisma.adminNotification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  }
}
