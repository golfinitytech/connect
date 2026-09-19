import { Module } from '@nestjs/common';
import { CaddiePerformanceController } from './caddie-performance.controller';
import { CaddiePerformanceService } from './caddie-performance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CaddiePerformanceController],
  providers: [CaddiePerformanceService],
})
export class CaddiePerformanceModule {}
