import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { CaddiePerformanceService } from './caddie-performance.service';

@Controller('caddie-performance')
export class CaddiePerformanceController {
  constructor(private readonly caddiePerformanceService: CaddiePerformanceService) {}

  @Post()
  create(@Body() data: any) {
    return this.caddiePerformanceService.create(data);
  }

  @Get()
  findAll(@Query('locationId') locationId?: string) {
    return this.caddiePerformanceService.findAll(locationId);
  }
}
