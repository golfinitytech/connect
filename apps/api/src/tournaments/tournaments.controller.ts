import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  create(@Body() createTournamentDto: any) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Post('sync-scores')
  syncScores(@Body() data: { flightCode: string, players: any[], caddie?: any, course?: string }) {
    return this.tournamentsService.syncScores(data.flightCode, data.players, data.caddie, data.course);
  }

  @Post('chat')
  chat(@Body() data: { to: 'control' | 'all' | 'marshal', fromRole: 'caddie' | 'admin' | 'marshal', from: string, text: string, course?: string }) {
    return this.tournamentsService.appendChatMessage(data);
  }

  @Get('chat')
  getChat(@Query('since') since?: string, @Query('course') course?: string) {
    const sinceNum = since ? Number(since) : undefined;
    return this.tournamentsService.getChatMessages(Number.isFinite(sinceNum as number) ? (sinceNum as number) : undefined, course);
  }

  @Get()
  findAll(@Query('course') course?: string) {
    return this.tournamentsService.findAll(course);
  }

  @Get('active')
  findActive(@Query('course') course?: string) {
    return this.tournamentsService.findActive(course);
  }

  @Delete()
  deleteAll() {
    return this.tournamentsService.deleteAll();
  }

  // Caddie Rounds API (in memory mock for now)
  private caddieRounds: any[] = [];

  @Post('rounds')
  recordCaddieRound(@Body() body: any) {
    const groupCode = body.groupCode || `CADDIE-${Math.floor(Math.random() * 10000)}`;
    
    // Update existing if exists
    const existingIdx = this.caddieRounds.findIndex(r => 
      r.locationId === body.locationId && 
      r.caddieCode === body.caddieCode && 
      !r.isCompleted
    );

    if (existingIdx >= 0) {
      this.caddieRounds[existingIdx] = {
        ...this.caddieRounds[existingIdx],
        players: body.players || this.caddieRounds[existingIdx].players,
        isCompleted: body.isCompleted !== undefined ? body.isCompleted : this.caddieRounds[existingIdx].isCompleted
      };
      return this.caddieRounds[existingIdx];
    }

    // Create new
    const newRound = {
      id: Math.random().toString(),
      tournamentId: 'CADDIE_MODE',
      groupCode,
      caddieCode: body.caddieCode,
      locationId: body.locationId,
      players: body.players || [],
      startTime: body.startTime || new Date().toISOString(),
      isCompleted: body.isCompleted || false
    };
    this.caddieRounds.push(newRound);
    return newRound;
  }

  @Get('rounds')
  getCaddieRounds() {
    return this.caddieRounds;
  }
}
