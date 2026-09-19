import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return {
      status: 'ok',
      service: 'golfinity-connect-api',
      now: new Date().toISOString(),
    };
  }

  @Get('system-status')
  async systemStatus() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { 
        api: 'ok',
        database: 'ok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        api: 'ok',
        database: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
