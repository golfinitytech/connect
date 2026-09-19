import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationCategory } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    category: NotificationCategory;
    metadata?: any;
  }) {
    // 1. Save to DB (In-app notification)
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        category: data.category,
      },
    });

    // 2. Check user preference for push notifications
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      include: { preference: true },
    });

    if (user?.fcmToken && user?.preference?.notificationsEnabled) {
      // 3. Send Push via Firebase
      await this.firebase.sendPushNotification(
        user.fcmToken,
        data.title,
        data.message,
        data.metadata,
      );
    }

    return notification;
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  findAll(userId?: string) {
    return this.prisma.notification.findMany({
      where: userId ? { userId } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
