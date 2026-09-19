import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsString } from 'class-validator';
import { EventsService } from './events.service';

class RegisterEventDto {
  @IsString()
  userId!: string;
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('registrations')
  findRegistrations(@Query('userId') userId?: string) {
    return this.eventsService.findRegistrations(userId);
  }

  @Post(':id/register')
  register(@Param('id') id: string, @Body() dto: RegisterEventDto) {
    return this.eventsService.register(id, dto.userId);
  }
}
