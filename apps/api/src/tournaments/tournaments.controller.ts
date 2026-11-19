import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import {
  EnterScoreDto,
  MarshalEditDto,
  PostMessageDto,
  UpdateSettingsDto,
  ValidateScoresDto,
  VerifyMarshalDto,
} from './dto/score.dto';

/**
 * NOTE: static routes are declared before the `:id` routes on purpose
 * (Nest matches in declaration order).
 *
 * TODO(auth): admin-only routes (create/edit/settings/finish/archive/logs)
 * should be protected once the dashboard has a real login.
 */
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  // ---- Admin: create / edit (legacy body: { info, groups, players, archivePrevious }) ----
  @Post()
  create(@Body() body: any) {
    return this.tournamentsService.create(body);
  }

  @Get()
  findAll(@Query('course') course?: string) {
    return this.tournamentsService.findAll(course);
  }

  @Get('active')
  findActive(@Query('course') course?: string) {
    return this.tournamentsService.findActive(course);
  }

  @Get('active/leaderboard')
  activeLeaderboard(@Query('course') course?: string) {
    return this.tournamentsService.activeLeaderboard(course);
  }

  /** Archives the active tournament (it used to delete ALL tournaments). */
  @Delete()
  archiveActive(@Query('course') course?: string) {
    return this.tournamentsService.archiveActive(course);
  }

  // ---- Tablet access: tournament code -> flight ----
  @Get('access/:code')
  accessByCode(@Param('code') code: string) {
    return this.tournamentsService.accessByCode(code);
  }

  @Get('access/:code/flights/:flight')
  accessFlight(@Param('code') code: string, @Param('flight') flight: string) {
    return this.tournamentsService.accessFlight(code, flight);
  }

  // ---- Legacy endpoints kept for older screens ----
  @Post('sync-scores')
  syncScores(@Body() data: { flightCode: string; players?: any[]; caddie?: any; course?: string }) {
    return this.tournamentsService.syncCaddie(data?.flightCode, data?.caddie, data?.course);
  }

  @Post('chat')
  chat(@Body() dto: PostMessageDto) {
    return this.tournamentsService.appendChatMessage(dto);
  }

  @Get('chat')
  getChat(@Query('since') since?: string, @Query('course') course?: string) {
    const n = since ? Number(since) : undefined;
    return this.tournamentsService.getChatMessages(Number.isFinite(n) ? n : undefined, course);
  }

  // Caddie-mode rounds (non-tournament) — still an in-memory mock, untouched.
  private caddieRounds: any[] = [];

  @Post('rounds')
  recordCaddieRound(@Body() body: any) {
    const groupCode = body.groupCode || `CADDIE-${Math.floor(Math.random() * 10000)}`;
    const existingIdx = this.caddieRounds.findIndex(
      (r) => r.locationId === body.locationId && r.caddieCode === body.caddieCode && !r.isCompleted,
    );
    if (existingIdx >= 0) {
      this.caddieRounds[existingIdx] = {
        ...this.caddieRounds[existingIdx],
        players: body.players || this.caddieRounds[existingIdx].players,
        isCompleted:
          body.isCompleted !== undefined ? body.isCompleted : this.caddieRounds[existingIdx].isCompleted,
      };
      return this.caddieRounds[existingIdx];
    }
    const newRound = {
      id: Math.random().toString(),
      tournamentId: 'CADDIE_MODE',
      groupCode,
      caddieCode: body.caddieCode,
      locationId: body.locationId,
      players: body.players || [],
      startTime: body.startTime || new Date().toISOString(),
      isCompleted: body.isCompleted || false,
    };
    this.caddieRounds.push(newRound);
    return newRound;
  }

  @Get('rounds')
  getCaddieRounds() {
    return this.caddieRounds;
  }

  // ---- Per-tournament routes ----
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Patch(':id/settings')
  updateSettings(@Param('id') id: string, @Body() dto: UpdateSettingsDto) {
    return this.tournamentsService.updateSettings(id, dto);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string) {
    return this.tournamentsService.finish(id);
  }

  @Post(':id/reopen')
  reopen(@Param('id') id: string) {
    return this.tournamentsService.reopen(id);
  }

  @Get(':id/flights/:flight')
  flight(@Param('id') id: string, @Param('flight') flight: string) {
    return this.tournamentsService.flightScorecard(id, flight);
  }

  @Get(':id/leaderboard')
  leaderboard(@Param('id') id: string) {
    return this.tournamentsService.leaderboard(id);
  }

  @Get(':id/score-logs')
  scoreLogs(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.tournamentsService.scoreLogs(id, limit ? Number(limit) || 200 : 200);
  }

  @Put(':id/scores')
  enterScore(@Param('id') id: string, @Body() dto: EnterScoreDto) {
    return this.tournamentsService.enterScore(id, dto);
  }

  @Post(':id/scores/validate')
  validateScores(@Param('id') id: string, @Body() dto: ValidateScoresDto) {
    return this.tournamentsService.validateScores(id, dto);
  }

  @Post(':id/scores/marshal-edit')
  marshalEdit(@Param('id') id: string, @Body() dto: MarshalEditDto) {
    return this.tournamentsService.marshalEdit(id, dto);
  }

  @Post(':id/marshal/verify')
  verifyMarshal(@Param('id') id: string, @Body() dto: VerifyMarshalDto) {
    return this.tournamentsService.verifyMarshal(id, dto.marshalPin);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @Query('since') since?: string) {
    const n = since ? Number(since) : undefined;
    return this.tournamentsService.getMessages(id, Number.isFinite(n) ? n : undefined);
  }

  @Post(':id/messages')
  postMessage(@Param('id') id: string, @Body() dto: PostMessageDto) {
    return this.tournamentsService.postMessage(id, dto);
  }
}
