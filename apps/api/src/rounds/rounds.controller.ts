import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateRoundDto } from './dto/create-round.dto';
import { UpdateHoleScoreDto } from './dto/update-hole-score.dto';
import { RoundsService } from './rounds.service';

@Controller('rounds')
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Get()
  findAll() {
    return this.roundsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateRoundDto) {
    return this.roundsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roundsService.findOne(id);
  }

  @Patch(':id/finish')
  finish(@Param('id') id: string) {
    return this.roundsService.finish(id);
  }

  @Put(':id/holes/:holeNumber')
  updateHoleScore(
    @Param('id') id: string,
    @Param('holeNumber', ParseIntPipe) holeNumber: number,
    @Body() dto: UpdateHoleScoreDto,
  ) {
    return this.roundsService.updateHoleScore(id, holeNumber, dto);
  }
}
