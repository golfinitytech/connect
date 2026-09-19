import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { AdminNotificationService } from './admin-notification.service';
import { Prisma } from '@prisma/client';

@Controller('admin-notifications')
export class AdminNotificationController {
  constructor(private readonly adminNotificationService: AdminNotificationService) {}

  @Post()
  async create(@Body() data: Prisma.AdminNotificationCreateInput) {
    return this.adminNotificationService.create(data);
  }

  @Get()
  async getLatest() {
    return this.adminNotificationService.getLatest();
  }

  @Put('approve')
  async updateApproval(
    @Body() data: { changedHole: number; changedPlayerName: string; isApproved: boolean },
  ) {
    return this.adminNotificationService.updateApproval(
      data.changedHole,
      data.changedPlayerName,
      data.isApproved,
    );
  }

  @Put('read')
  async markAllAsRead() {
    return this.adminNotificationService.markAllAsRead();
  }
}
