import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findAll() {
    return this.prisma.event.findMany({
      include: {
        course: {
          include: {
            teeBoxes: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  findRegistrations(userId?: string) {
    return this.prisma.eventRegistration.findMany({
      where: userId ? { userId } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async register(eventId: string, userId: string) {
    const registration = await this.prisma.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      update: {},
      create: {
        eventId,
        userId,
      },
      include: {
        event: true,
      },
    });

    // Send notification
    await this.notifications.create({
      userId,
      title: 'Tournament Registration 🏆',
      message: `You've successfully registered for "${registration.event.title}"!`,
      category: NotificationCategory.TOURNAMENT,
      metadata: { eventId },
    });

    return registration;
  }
}
