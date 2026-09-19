import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, NotificationCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../mail/email.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
  ) {}

  async create(dto: CreateOrderDto) {
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: {
          in: dto.items.map((item) => item.menuItemId),
        },
      },
    });

    const priceMap = new Map(
      menuItems.map((item) => [item.id, Number(item.price)]),
    );
    const subtotal = dto.items.reduce((sum, item) => {
      const unitPrice = priceMap.get(item.menuItemId) ?? 0;
      return sum + unitPrice * item.quantity;
    }, 0);
    const serviceFee = subtotal * 0.18;
    const totalPaid = subtotal + serviceFee;

    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        roundId: dto.roundId,
        locationId: dto.locationId,
        caddieCode: dto.caddieCode,
        holeNumber: dto.holeNumber,
        status: OrderStatus.PENDING,
        subtotal,
        serviceFee,
        totalPaid,
        items: {
          create: dto.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: priceMap.get(item.menuItemId) ?? 0,
          })),
        },
        statusLogs: {
          create: {
            status: OrderStatus.PENDING,
            note: 'Order created',
          },
        },
      },
      include: {
        user: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Send notification
    await this.notifications.create({
      userId: order.userId,
      title: 'Order Placed! 🍔',
      message: `Your order #${order.id.slice(-6).toUpperCase()} has been received.`,
      category: NotificationCategory.ORDER,
      metadata: { orderId: order.id },
    });

    // Send email
    await this.email.sendOrderConfirmationEmail(
      order.user.email,
      order.user.fullName,
      order,
    );

    return order;
  }

  async findAll(userId?: string, locationId?: string) {
    const whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (locationId) whereClause.locationId = locationId;

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        items: {
          include: {
            menuItem: true,
          },
        },
        statusLogs: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        statusLogs: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const existingOrder = await this.prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        statusLogs: {
          create: {
            status: dto.status,
            note: dto.note,
          },
        },
      },
      include: {
        user: true,
        items: {
          include: {
            menuItem: true,
          },
        },
        statusLogs: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Send notification for status update
    let statusMessage = '';
    switch (order.status) {
      case OrderStatus.PREPARING:
        statusMessage = 'Your order is being prepared! 🍳';
        break;
      case OrderStatus.ON_THE_WAY:
        statusMessage = 'Your order is on the way! 🏎️';
        break;
      case OrderStatus.DELIVERED:
        statusMessage = 'Your order has been delivered! Enjoy! ⛳';
        break;
      case OrderStatus.CANCELLED:
        statusMessage = 'Your order has been cancelled.';
        break;
    }

    if (statusMessage) {
      await this.notifications.create({
        userId: order.userId,
        title: 'Order Update',
        message: statusMessage,
        category: NotificationCategory.ORDER,
        metadata: { orderId: order.id, status: order.status },
      });
    }

    return order;
  }
}
