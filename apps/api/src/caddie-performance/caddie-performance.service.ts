import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaddiePerformanceService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.caddiePerformance.create({
      data: {
        locationId: data.locationId,
        caddieCode: data.caddieCode,
        playerName: data.playerName,
      },
    });
  }

  async findAll(locationId?: string) {
    return this.prisma.caddiePerformance.findMany({
      where: locationId ? { locationId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
