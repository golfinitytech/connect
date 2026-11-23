import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TournamentScoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  EnterScoreDto,
  MarshalEditDto,
  PostMessageDto,
  UpdateSettingsDto,
  ValidateScoresDto,
} from './dto/score.dto';
import {
  assertValidScore,
  buildLeaderboard,
  generateTournamentCode,
  normalizeCode,
  normalizeFlightCode,
  resolvePars,
  ScoreValidationError,
  toLegacyPlayer,
  flightProgress,
} from './tournament-scoring';

type Tx = Prisma.TransactionClient;

/** Fields never sent to clients. */
function publicTournament<T extends { marshalPin?: string | null }>(t: T) {
  const { marshalPin, ...rest } = t;
  return { ...rest, hasMarshalPin: !!marshalPin };
}

function flightFromHandicap(hcp: number) {
  if (hcp >= 1 && hcp <= 13) return 'A';
  if (hcp >= 14 && hcp <= 21) return 'B';
  return 'C';
}

function randomPin() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

/** A repeat publish (same course + name) within this window returns the existing tournament. */
const DUPLICATE_PUBLISH_WINDOW_MS = 60_000;

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(private prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // Lookup helpers
  // -------------------------------------------------------------------------

  private activeWhere(course?: string): Prisma.TournamentWhereInput {
    return { publishedAt: { not: null }, ...(course ? { course } : {}) };
  }

  private async getActiveTournament(course?: string) {
    return this.prisma.tournament.findFirst({
      where: this.activeWhere(course),
      orderBy: { publishedAt: 'desc' },
    });
  }

  private async getTournamentOrThrow(id: string) {
    const t = await this.prisma.tournament.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Turnamen tidak ditemukan.');
    return t;
  }

  private async getWritableTournament(id: string) {
    const t = await this.getTournamentOrThrow(id);
    if (!t.publishedAt) throw new ForbiddenException('Turnamen sudah diarsipkan.');
    if (t.finishedAt) throw new ForbiddenException('Turnamen sudah selesai, skor terkunci.');
    return t;
  }

  private async scoreRows(tournamentId: string) {
    return this.prisma.tournamentScore.findMany({ where: { tournamentId } });
  }

  /** Tournament with groups/players, and players carrying their scores in the legacy UI shape. */
  private async loadFull(tournamentId: string) {
    const t = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        players: { orderBy: { code: 'asc' } },
        groups: { include: { players: { orderBy: { code: 'asc' } } } },
      },
    });
    if (!t) return null;
    const rows = await this.scoreRows(t.id);
    const rowsByPlayer = new Map<string, typeof rows>();
    for (const r of rows) {
      if (!rowsByPlayer.has(r.playerId)) rowsByPlayer.set(r.playerId, []);
      rowsByPlayer.get(r.playerId)!.push(r);
    }
    const legacy = <P extends { id: string }>(p: P) => toLegacyPlayer(p, rowsByPlayer.get(p.id) || []);
    const groups = [...t.groups]
      .sort((a, b) => (a.number ?? 999) - (b.number ?? 999) || a.code.localeCompare(b.code))
      .map((g) => ({
        ...g,
        caddie: g.caddieData ?? undefined,
        players: g.players.map(legacy),
      }));
    return publicTournament({
      ...t,
      pars: resolvePars(t.pars),
      players: t.players.map(legacy),
      groups,
    });
  }

  // -------------------------------------------------------------------------
  // Create / edit (never destructive to scores)
  // -------------------------------------------------------------------------

  /**
   * Legacy entry point used by the dashboard for both "publish" and "edit".
   * - body.info.id of an existing tournament -> roster update in place (scores kept).
   * - otherwise -> new tournament; the previous active tournament on the same
   *   course is archived (never deleted).
   */
  async create(data: any) {
    const info = data?.info || {};
    const existingId: string | undefined = info.id || data?.id;
    if (existingId) {
      const existing = await this.prisma.tournament.findUnique({ where: { id: existingId } });
      if (existing) return this.updateRoster(existing.id, data);
    }
    return this.createNew(data);
  }

  private async createNew(data: any) {
    const info = data?.info || {};
    const groups: any[] = Array.isArray(data?.groups) ? data.groups : [];
    const looseRaw: any[] = Array.isArray(data?.players) ? data.players : [];
    const course: string = info.course || data?.course || 'Default Course';
    const requestedPin = (info.marshalPin || data?.marshalPin || '').toString().trim();
    const marshalPin = /^\d{4}$/.test(requestedPin) ? requestedPin : randomPin();
    const currentYear = new Date().getFullYear();

    const name: string = info.name || 'Tournament';
    let duplicateOf: { id: string; marshalPin: string | null } | null = null;

    const created = await this.prisma.$transaction(async (tx) => {
      // Serialize publishes per course so a double submit can't race past the check below.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'tournament-publish:' + course}))`;

      // Same tournament published again within a minute (double click, retry): reuse it.
      const recent = await tx.tournament.findFirst({
        where: {
          course,
          name,
          publishedAt: { not: null },
          createdAt: { gte: new Date(Date.now() - DUPLICATE_PUBLISH_WINDOW_MS) },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, marshalPin: true },
      });
      if (recent) {
        duplicateOf = recent;
        return null;
      }

      // Archive (not delete) whatever is currently active on this course.
      await tx.tournament.updateMany({
        where: { publishedAt: { not: null }, course },
        data: { publishedAt: null },
      });

      const active = await tx.tournament.findMany({
        where: { publishedAt: { not: null }, code: { not: null } },
        select: { code: true },
      });
      const code = generateTournamentCode(new Set(active.map((a) => a.code!)));

      const t = await tx.tournament.create({
        data: {
          name,
          date: new Date(info.date || new Date()),
          course,
          teeBox: info.tee || info.teeBox || 'White',
          teeTime: info.teeTime || '07:00',
          rules: info.rules || 'Stroke Play',
          scoringMethod: info.scoringMethod || 'Gross',
          code,
          marshalPin,
          pars: Array.isArray(info.pars) ? resolvePars(info.pars) : undefined,
          publishedAt: new Date(),
        },
      });

      let counter = 1;
      const nextPlayerCode = () =>
        `GF-${currentYear}-${code}-${(counter++).toString().padStart(3, '0')}`;
      const playerData = (p: any) => {
        const hcp = parseInt(p.handicap) || 0;
        return {
          tournamentId: t.id,
          code: nextPlayerCode(),
          name: (p.name || '').toString().trim() || 'Player',
          dob: p.dob || '',
          shirtSize: p.shirtSize || 'L',
          phone: p.phone || '',
          email: p.email || '',
          handicap: hcp,
          flight: p.flight || flightFromHandicap(hcp),
        };
      };

      // Batched writes: one query for all groups, one for all players (remote DB latency).
      const createdGroups = groups.length
        ? await tx.tournamentGroup.createManyAndReturn({
            data: groups.map((g, i) => ({
              tournamentId: t.id,
              number: i + 1,
              code: String(i + 1),
              startHole: Number.isInteger(g.startHole) ? g.startHole : null,
              flightType: g.flightType || '',
              caddieData: g.caddie ?? undefined,
            })),
            select: { id: true, number: true },
          })
        : [];
      const groupIdByNumber = new Map(createdGroups.map((g) => [g.number, g.id]));

      const groupedIds = new Set<string>();
      const rows: Prisma.TournamentPlayerCreateManyInput[] = [];
      groups.forEach((g, i) => {
        for (const p of g.players || []) {
          if (p?.id !== undefined) groupedIds.add(String(p.id));
          rows.push({ ...playerData(p), groupId: groupIdByNumber.get(i + 1) ?? null });
        }
      });
      for (const p of looseRaw) {
        if (p?.id !== undefined && groupedIds.has(String(p.id))) continue;
        rows.push({ ...playerData(p), groupId: null });
      }
      if (rows.length) await tx.tournamentPlayer.createMany({ data: rows });
      return t;
    });

    if (!created) {
      const dup = duplicateOf as unknown as { id: string; marshalPin: string | null };
      this.logger.warn(`Duplicate publish of "${name}" on ${course} ignored; returning ${dup.id}`);
      const full = await this.loadFull(dup.id);
      return { ...full, marshalPin: dup.marshalPin };
    }

    this.logger.log(`Tournament ${created.id} created with code ${created.code}`);
    const full = await this.loadFull(created.id);
    // The PIN is returned once, on creation, so the admin can hand it to marshals.
    return { ...full, marshalPin: created.marshalPin };
  }

  /**
   * Applies an edited roster to an existing tournament without touching scores.
   * Players/groups missing from the payload are only removed when they have no scores.
   */
  async updateRoster(tournamentId: string, data: any) {
    const t = await this.getTournamentOrThrow(tournamentId);
    const info = data?.info || {};
    const groupsIn: any[] = Array.isArray(data?.groups) ? data.groups : [];
    const playersIn: any[] = Array.isArray(data?.players) ? data.players : [];
    const currentYear = new Date().getFullYear();

    await this.prisma.$transaction(async (tx) => {
      await tx.tournament.update({
        where: { id: t.id },
        data: {
          ...(info.name ? { name: info.name } : {}),
          ...(info.date ? { date: new Date(info.date) } : {}),
          ...(info.teeTime ? { teeTime: info.teeTime } : {}),
          ...(info.tee || info.teeBox ? { teeBox: info.tee || info.teeBox } : {}),
          ...(info.rules ? { rules: info.rules } : {}),
        },
      });

      const dbGroups = await tx.tournamentGroup.findMany({ where: { tournamentId: t.id } });
      const dbPlayers = await tx.tournamentPlayer.findMany({ where: { tournamentId: t.id } });
      const playerById = new Map(dbPlayers.map((p) => [p.id, p]));
      const playerByCode = new Map(dbPlayers.filter((p) => p.code).map((p) => [p.code!, p]));
      const groupByCode = new Map(dbGroups.map((g) => [g.code, g]));
      let maxNumber = dbGroups.reduce((m, g) => Math.max(m, g.number ?? 0), 0);
      let counter = dbPlayers.length + 1;

      const seenPlayers = new Set<string>();
      const seenGroups = new Set<string>();
      const newPlayers: Prisma.TournamentPlayerCreateManyInput[] = [];
      const newCodes = new Set<string>();

      const upsertPlayer = async (p: any, groupId: string | null) => {
        const existing =
          (p?.id && playerById.get(String(p.id))) || (p?.code && playerByCode.get(String(p.code)));
        const hcp = parseInt(p.handicap) || 0;
        const fields = {
          name: (p.name || '').toString().trim() || 'Player',
          dob: p.dob || '',
          shirtSize: p.shirtSize || 'L',
          phone: p.phone || '',
          email: p.email || '',
          handicap: hcp,
          flight: p.flight || flightFromHandicap(hcp),
        };
        if (existing) {
          seenPlayers.add(existing.id);
          const nextGroup = groupId !== undefined ? groupId : existing.groupId;
          const changed =
            nextGroup !== existing.groupId ||
            (Object.keys(fields) as (keyof typeof fields)[]).some((k) => existing[k] !== fields[k]);
          // Skip no-op writes: each query is a network round-trip to the remote DB.
          if (changed) {
            await tx.tournamentPlayer.update({
              where: { id: existing.id },
              data: { ...fields, groupId: nextGroup },
            });
          }
        } else {
          let code: string;
          do {
            code = `GF-${currentYear}-${t.code ?? 'T'}-${(counter++).toString().padStart(3, '0')}`;
          } while (playerByCode.has(code) || newCodes.has(code));
          newCodes.add(code);
          newPlayers.push({ tournamentId: t.id, code, groupId, ...fields });
        }
      };

      for (const g of groupsIn) {
        const code = normalizeFlightCode(g.code);
        let group = groupByCode.get(code);
        if (group) {
          const data = {
            flightType: g.flightType ?? group.flightType,
            ...(g.caddie ? { caddieData: g.caddie } : {}),
            ...(Number.isInteger(g.startHole) ? { startHole: g.startHole } : {}),
          };
          const changed =
            data.flightType !== group.flightType ||
            ('caddieData' in data && JSON.stringify(data.caddieData) !== JSON.stringify(group.caddieData)) ||
            ('startHole' in data && data.startHole !== group.startHole);
          if (changed) group = await tx.tournamentGroup.update({ where: { id: group.id }, data });
        } else {
          maxNumber += 1;
          group = await tx.tournamentGroup.create({
            data: {
              tournamentId: t.id,
              number: maxNumber,
              code: String(maxNumber),
              flightType: g.flightType || '',
              caddieData: g.caddie ?? undefined,
              startHole: Number.isInteger(g.startHole) ? g.startHole : null,
            },
          });
        }
        seenGroups.add(group.id);
        for (const p of g.players || []) await upsertPlayer(p, group.id);
      }
      for (const p of playersIn) {
        const known =
          (p?.id && playerById.get(String(p.id))) || (p?.code && playerByCode.get(String(p.code)));
        if (known && seenPlayers.has(known.id)) continue;
        // Loose player: keep their current group if they already exist.
        await upsertPlayer(p, known ? known.groupId : null);
      }
      if (newPlayers.length) await tx.tournamentPlayer.createMany({ data: newPlayers });

      // Remove players that disappeared from the payload, but never if they have scores.
      const scored = new Set(
        (
          await tx.tournamentScore.findMany({
            where: { tournamentId: t.id },
            select: { playerId: true },
            distinct: ['playerId'],
          })
        ).map((s) => s.playerId),
      );
      const toDelete = dbPlayers.filter((p) => !seenPlayers.has(p.id) && !scored.has(p.id));
      if (toDelete.length) {
        await tx.tournamentPlayer.deleteMany({ where: { id: { in: toDelete.map((p) => p.id) } } });
      }
      const kept = dbPlayers.filter((p) => !seenPlayers.has(p.id) && scored.has(p.id));
      if (kept.length) {
        this.logger.warn(
          `Roster update for ${t.id}: kept ${kept.length} removed player(s) because they already have scores`,
        );
      }

      // Remove empty groups that disappeared from the payload.
      for (const g of dbGroups) {
        if (seenGroups.has(g.id) || groupsIn.length === 0) continue;
        const count = await tx.tournamentPlayer.count({ where: { groupId: g.id } });
        if (count === 0) await tx.tournamentGroup.delete({ where: { id: g.id } });
      }
    });

    return this.loadFull(t.id);
  }

  async updateSettings(id: string, dto: UpdateSettingsDto) {
    await this.getTournamentOrThrow(id);
    await this.prisma.tournament.update({
      where: { id },
      data: {
        ...(dto.marshalPin ? { marshalPin: dto.marshalPin.trim() } : {}),
        ...(dto.pars ? { pars: dto.pars } : {}),
        ...(dto.name ? { name: dto.name } : {}),
      },
    });
    return this.loadFull(id);
  }

  async finish(id: string) {
    await this.getTournamentOrThrow(id);
    await this.prisma.tournament.update({ where: { id }, data: { finishedAt: new Date() } });
    return this.loadFull(id);
  }

  async reopen(id: string) {
    await this.getTournamentOrThrow(id);
    await this.prisma.tournament.update({ where: { id }, data: { finishedAt: null } });
    return this.loadFull(id);
  }

  /** Replaces the old "delete everything": archives the active tournament instead. */
  async archiveActive(course?: string) {
    const res = await this.prisma.tournament.updateMany({
      where: this.activeWhere(course),
      data: { publishedAt: null },
    });
    return { archived: res.count };
  }

  // -------------------------------------------------------------------------
  // Reads
  // -------------------------------------------------------------------------

  async findAll(course?: string) {
    const list = await this.prisma.tournament.findMany({
      where: course ? { course } : undefined,
      include: { players: true, groups: { include: { players: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(publicTournament);
  }

  async findActive(course?: string) {
    const t = await this.getActiveTournament(course);
    if (!t) return null;
    return this.loadFull(t.id);
  }

  async findOne(id: string) {
    const full = await this.loadFull(id);
    if (!full) throw new NotFoundException('Turnamen tidak ditemukan.');
    return full;
  }

  /** Step 1 on the tablet: tournament code -> tournament + list of flights. */
  async accessByCode(codeRaw: string) {
    const code = normalizeCode(codeRaw);
    const t = await this.prisma.tournament.findFirst({
      where: { code, publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      include: { groups: { include: { players: { select: { id: true, name: true } } } } },
    });
    if (!t) throw new NotFoundException('Kode turnamen tidak ditemukan.');
    return {
      id: t.id,
      code: t.code,
      name: t.name,
      course: t.course,
      date: t.date,
      teeTime: t.teeTime,
      isFinished: !!t.finishedAt,
      flights: [...t.groups]
        .sort((a, b) => (a.number ?? 999) - (b.number ?? 999))
        .map((g) => ({
          id: g.id,
          number: g.number,
          code: g.code,
          flightType: g.flightType,
          startHole: g.startHole,
          caddie: g.caddieData ?? null,
          players: g.players.map((p) => p.name),
        })),
    };
  }

  /** Step 2 on the tablet: tournament code + flight code -> scorecard data. */
  async accessFlight(codeRaw: string, flightRaw: string) {
    const code = normalizeCode(codeRaw);
    const flight = normalizeFlightCode(flightRaw);
    const t = await this.prisma.tournament.findFirst({
      where: { code, publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
    });
    if (!t) throw new NotFoundException('Kode turnamen tidak ditemukan.');
    return this.flightScorecard(t.id, flight);
  }

  async flightScorecard(tournamentId: string, flightCode: string) {
    const t = await this.getTournamentOrThrow(tournamentId);
    const group = await this.prisma.tournamentGroup.findFirst({
      where: { tournamentId, code: normalizeFlightCode(flightCode) },
      include: { players: { orderBy: { code: 'asc' } } },
    });
    if (!group) throw new NotFoundException('Nomor flight tidak ditemukan di turnamen ini.');
    const rows = await this.prisma.tournamentScore.findMany({
      where: { playerId: { in: group.players.map((p) => p.id) } },
    });
    return {
      tournament: {
        id: t.id,
        code: t.code,
        name: t.name,
        course: t.course,
        date: t.date,
        teeTime: t.teeTime,
        isFinished: !!t.finishedAt,
        pars: resolvePars(t.pars),
      },
      flight: {
        id: group.id,
        number: group.number,
        code: group.code,
        flightType: group.flightType,
        startHole: group.startHole,
        caddie: group.caddieData ?? null,
      },
      players: group.players.map((p) =>
        toLegacyPlayer(p, rows.filter((r) => r.playerId === p.id)),
      ),
    };
  }

  async leaderboard(tournamentId: string) {
    const t = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { players: { include: { group: { select: { code: true } } } } },
    });
    if (!t) throw new NotFoundException('Turnamen tidak ditemukan.');
    const rows = await this.scoreRows(t.id);
    const pars = resolvePars(t.pars);
    const entries = buildLeaderboard(
      t.players.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        flight: p.flight,
        handicap: p.handicap,
        groupCode: p.group?.code ?? null,
      })),
      rows,
      pars,
    );
    return {
      tournament: {
        id: t.id,
        code: t.code,
        name: t.name,
        course: t.course,
        date: t.date,
        isFinished: !!t.finishedAt,
        pars,
      },
      generatedAt: new Date().toISOString(),
      entries,
    };
  }

  async activeLeaderboard(course?: string) {
    const t = await this.getActiveTournament(course);
    if (!t) return null;
    return this.leaderboard(t.id);
  }

  /**
   * Live position of every flight in the active tournament: which hole it is on
   * (first hole in play order not confirmed by all players), progress and last activity.
   */
  async activeTracker(course?: string) {
    const t = await this.getActiveTournament(course);
    if (!t) return null;
    const groups = await this.prisma.tournamentGroup.findMany({
      where: { tournamentId: t.id },
      orderBy: [{ number: 'asc' }, { code: 'asc' }],
      select: {
        id: true,
        code: true,
        number: true,
        startHole: true,
        flightType: true,
        caddieData: true,
        players: { select: { id: true, name: true }, orderBy: { code: 'asc' } },
      },
    });
    const allIds = groups.flatMap((g) => g.players.map((p) => p.id));
    const { rows, stateOf } = await this.groupState(this.prisma, allIds);
    const lastByPlayer = new Map<string, Date>();
    for (const r of rows) {
      const prev = lastByPlayer.get(r.playerId);
      if (!prev || r.updatedAt > prev) lastByPlayer.set(r.playerId, r.updatedAt);
    }

    const flights = groups.map((g) => {
      const ids = g.players.map((p) => p.id);
      const startHole = g.startHole ?? 1;
      const progress = flightProgress(startHole, ids, stateOf);
      const last = ids
        .map((id) => lastByPlayer.get(id))
        .filter((d): d is Date => !!d)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      const caddie = (g.caddieData ?? null) as { number?: string; name?: string } | null;
      return {
        id: g.id,
        code: g.code,
        number: g.number,
        flightType: g.flightType,
        startHole,
        startHoleSet: g.startHole != null,
        players: g.players.map((p) => p.name),
        caddie: caddie ? { number: caddie.number ?? null, name: caddie.name ?? null } : null,
        currentHole: progress.currentHole,
        holesDone: progress.holesDone,
        started: progress.started,
        finished: progress.finished,
        awaitingConfirmation: progress.awaitingConfirmation,
        lastActivityAt: last ?? null,
      };
    });

    return {
      tournament: { id: t.id, name: t.name, code: t.code, course: t.course, isFinished: !!t.finishedAt },
      pars: resolvePars(t.pars),
      flights,
      generatedAt: new Date(),
    };
  }

  async scoreLogs(tournamentId: string, limit = 200) {
    return this.prisma.tournamentScoreLog.findMany({
      where: { tournamentId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 1000),
    });
  }

  // -------------------------------------------------------------------------
  // Scoring
  // -------------------------------------------------------------------------

  private async playerInTournament(tx: Tx, tournamentId: string, playerId: string) {
    const p = await tx.tournamentPlayer.findFirst({
      where: { id: playerId, tournamentId },
      include: { group: { select: { code: true } } },
    });
    if (!p) throw new NotFoundException('Pemain tidak terdaftar di turnamen ini.');
    return p;
  }

  private checkScoreInput(dto: EnterScoreDto) {
    const isOut = !!dto.out;
    try {
      assertValidScore(dto.hole, dto.strokes ?? null, isOut);
    } catch (e) {
      if (e instanceof ScoreValidationError) throw new BadRequestException(e.message);
      throw e;
    }
    return isOut;
  }

  /** Caddie input. Rejected once the hole has been validated by the player. */
  /** Score rows of a group's players, as `stateOf` for flightProgress(). */
  private async groupState(tx: Tx | PrismaService, playerIds: string[]) {
    const rows = await tx.tournamentScore.findMany({
      where: { playerId: { in: playerIds } },
      select: { playerId: true, hole: true, strokes: true, isOut: true, status: true, updatedAt: true },
    });
    const byKey = new Map(rows.map((r) => [`${r.playerId}:${r.hole}`, r]));
    const stateOf = (playerId: string, hole: number) => {
      const r = byKey.get(`${playerId}:${hole}`);
      const hasScore = !!r && (r.isOut || r.strokes !== null);
      return { hasScore, done: hasScore && (r!.isOut || r!.status === TournamentScoreStatus.VALIDATED) };
    };
    return { rows, stateOf };
  }

  /**
   * Caddies must play holes in order from the flight's start hole, and confirm a hole
   * before moving on. Throws 409 HOLE_ORDER otherwise. Marshal edits are not checked.
   */
  private async assertHoleInSequence(
    tx: Tx,
    player: { groupId: string | null },
    dto: EnterScoreDto,
  ) {
    if (!player.groupId) return;
    const group = await tx.tournamentGroup.findUnique({
      where: { id: player.groupId },
      select: { id: true, startHole: true, players: { select: { id: true } } },
    });
    if (!group) return;
    const ids = group.players.map((p) => p.id);
    const { rows, stateOf } = await this.groupState(tx, ids);

    let start = group.startHole;
    if (start == null) {
      // Older flights that already have scores but no recorded start: don't block them.
      if (rows.length > 0) return;
      start = dto.startHole ?? dto.hole;
      await tx.tournamentGroup.update({ where: { id: group.id }, data: { startHole: start } });
    }

    const { currentHole } = flightProgress(start, ids, stateOf);
    if (currentHole !== null && dto.hole !== currentHole) {
      throw new ConflictException({
        message: `Hole ${dto.hole} belum bisa diisi. Isi dan konfirmasi skor hole ${currentHole} dulu.`,
        code: 'HOLE_ORDER',
        currentHole,
      });
    }
  }

  async enterScore(tournamentId: string, dto: EnterScoreDto) {
    await this.getWritableTournament(tournamentId);
    const isOut = this.checkScoreInput(dto);
    const strokes = isOut ? null : (dto.strokes ?? null);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const player = await this.playerInTournament(tx, tournamentId, dto.playerId);
        const existing = await tx.tournamentScore.findUnique({
          where: { playerId_hole: { playerId: player.id, hole: dto.hole } },
        });

        if (existing?.status === TournamentScoreStatus.VALIDATED) {
          throw new ConflictException({
            message: 'Skor hole ini sudah dikonfirmasi player. Perubahan hanya bisa lewat marshal.',
            code: 'SCORE_LOCKED',
            current: existing,
          });
        }
        if (
          existing &&
          dto.expectedVersion !== undefined &&
          dto.expectedVersion !== existing.version
        ) {
          throw new ConflictException({
            message: 'Skor sudah diubah dari device lain. Data terbaru sudah dimuat.',
            code: 'VERSION_CONFLICT',
            current: existing,
          });
        }

        await this.assertHoleInSequence(tx, player, dto);

        // Clearing an unvalidated score.
        if (!isOut && strokes === null) {
          if (existing) {
            await tx.tournamentScore.delete({ where: { id: existing.id } });
            await tx.tournamentScoreLog.create({
              data: {
                tournamentId,
                playerId: player.id,
                playerName: player.name,
                hole: dto.hole,
                action: 'CLEAR',
                oldStrokes: existing.strokes,
                oldIsOut: existing.isOut,
                actorRole: 'caddie',
                actorName: dto.actorName,
                groupCode: player.group?.code ?? dto.groupCode,
              },
            });
          }
          return { playerId: player.id, hole: dto.hole, cleared: true };
        }

        // OUT is final immediately (same as the previous UI behaviour).
        const status = isOut ? TournamentScoreStatus.VALIDATED : TournamentScoreStatus.ENTERED;
        const saved = existing
          ? await tx.tournamentScore.update({
              where: { id: existing.id },
              data: {
                strokes,
                isOut,
                status,
                enteredBy: dto.actorName,
                version: { increment: 1 },
                ...(isOut ? { validatedAt: new Date(), validatedBy: dto.actorName } : {}),
              },
            })
          : await tx.tournamentScore.create({
              data: {
                tournamentId,
                playerId: player.id,
                hole: dto.hole,
                strokes,
                isOut,
                status,
                enteredBy: dto.actorName,
                ...(isOut ? { validatedAt: new Date(), validatedBy: dto.actorName } : {}),
              },
            });

        // A player who is OUT is out for the rest of the round: mark every hole
        // without a score as OUT too, so the flight can keep moving.
        if (isOut) {
          const scored = await tx.tournamentScore.findMany({
            where: { playerId: player.id },
            select: { hole: true },
          });
          const have = new Set(scored.map((r) => r.hole));
          const now = new Date();
          const missing = Array.from({ length: 18 }, (_, i) => i + 1).filter((h) => !have.has(h));
          if (missing.length) {
            await tx.tournamentScore.createMany({
              data: missing.map((h) => ({
                tournamentId,
                playerId: player.id,
                hole: h,
                strokes: null,
                isOut: true,
                status: TournamentScoreStatus.VALIDATED,
                enteredBy: dto.actorName,
                validatedAt: now,
                validatedBy: dto.actorName,
              })),
            });
          }
        }

        await tx.tournamentScoreLog.create({
          data: {
            tournamentId,
            playerId: player.id,
            playerName: player.name,
            hole: dto.hole,
            action: 'ENTER',
            oldStrokes: existing?.strokes ?? null,
            newStrokes: strokes,
            oldIsOut: existing?.isOut ?? null,
            newIsOut: isOut,
            actorRole: 'caddie',
            actorName: dto.actorName,
            groupCode: player.group?.code ?? dto.groupCode,
          },
        });
        return saved;
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException({
          message: 'Skor sedang disimpan dari device lain. Coba lagi.',
          code: 'VERSION_CONFLICT',
        });
      }
      throw e;
    }
  }

  /** Player confirms the entered scores for the given holes. */
  async validateScores(tournamentId: string, dto: ValidateScoresDto) {
    await this.getWritableTournament(tournamentId);
    return this.prisma.$transaction(async (tx) => {
      const players = await tx.tournamentPlayer.findMany({
        where: { id: { in: dto.playerIds }, tournamentId },
        include: { group: { select: { code: true } } },
      });
      if (players.length !== new Set(dto.playerIds).size) {
        throw new NotFoundException('Ada pemain yang tidak terdaftar di turnamen ini.');
      }
      const rows = await tx.tournamentScore.findMany({
        where: {
          playerId: { in: dto.playerIds },
          hole: { in: dto.holes },
          status: TournamentScoreStatus.ENTERED,
          strokes: { not: null },
        },
      });
      const now = new Date();
      for (const r of rows) {
        await tx.tournamentScore.update({
          where: { id: r.id },
          data: {
            status: TournamentScoreStatus.VALIDATED,
            validatedAt: now,
            validatedBy: dto.validatedBy,
            version: { increment: 1 },
          },
        });
        const p = players.find((x) => x.id === r.playerId)!;
        await tx.tournamentScoreLog.create({
          data: {
            tournamentId,
            playerId: p.id,
            playerName: p.name,
            hole: r.hole,
            action: 'VALIDATE',
            oldStrokes: r.strokes,
            newStrokes: r.strokes,
            actorRole: 'player',
            actorName: dto.validatedBy || p.name,
            groupCode: p.group?.code ?? dto.groupCode,
          },
        });
      }
      return { validated: rows.length };
    });
  }

  private async checkMarshalPin(tournamentId: string, pin: string) {
    const t = await this.getTournamentOrThrow(tournamentId);
    const expected = t.marshalPin || process.env.MARSHAL_PIN;
    if (!expected) throw new ForbiddenException('PIN marshal belum diatur untuk turnamen ini.');
    if ((pin || '').trim() !== expected) throw new ForbiddenException('PIN marshal salah.');
    return t;
  }

  async verifyMarshal(tournamentId: string, pin: string) {
    await this.checkMarshalPin(tournamentId, pin);
    return { ok: true };
  }

  /** Marshal edit: the only way to change a validated score. Always logged. */
  async marshalEdit(tournamentId: string, dto: MarshalEditDto) {
    await this.checkMarshalPin(tournamentId, dto.marshalPin);
    await this.getWritableTournament(tournamentId);
    const isOut = this.checkScoreInput(dto);
    const strokes = isOut ? null : (dto.strokes ?? null);
    if (!isOut && strokes === null) {
      throw new BadRequestException('Marshal harus mengisi skor atau OUT.');
    }

    return this.prisma.$transaction(async (tx) => {
      const player = await this.playerInTournament(tx, tournamentId, dto.playerId);
      const existing = await tx.tournamentScore.findUnique({
        where: { playerId_hole: { playerId: player.id, hole: dto.hole } },
      });
      const data = {
        strokes,
        isOut,
        status: TournamentScoreStatus.VALIDATED,
        editedByMarshal: true,
        validatedAt: new Date(),
        validatedBy: dto.actorName ? `Marshal ${dto.actorName}` : 'Marshal',
      };
      const saved = existing
        ? await tx.tournamentScore.update({
            where: { id: existing.id },
            data: { ...data, version: { increment: 1 } },
          })
        : await tx.tournamentScore.create({
            data: { tournamentId, playerId: player.id, hole: dto.hole, ...data },
          });
      await tx.tournamentScoreLog.create({
        data: {
          tournamentId,
          playerId: player.id,
          playerName: player.name,
          hole: dto.hole,
          action: 'MARSHAL_EDIT',
          oldStrokes: existing?.strokes ?? null,
          newStrokes: strokes,
          oldIsOut: existing?.isOut ?? null,
          newIsOut: isOut,
          actorRole: 'marshal',
          actorName: dto.actorName,
          groupCode: player.group?.code ?? dto.groupCode,
          reason: dto.reason,
        },
      });
      return saved;
    });
  }

  /** Legacy endpoint: tablets used to push the whole score blob. Now only the caddie assignment is stored. */
  async syncCaddie(flightCode: string, caddie?: any, course?: string) {
    if (!caddie) return null;
    const t = await this.getActiveTournament(course);
    if (!t) return null;
    const group = await this.prisma.tournamentGroup.findFirst({
      where: { tournamentId: t.id, code: normalizeFlightCode(flightCode) },
    });
    if (!group) return null;
    return this.prisma.tournamentGroup.update({
      where: { id: group.id },
      data: { caddieData: caddie },
    });
  }

  // -------------------------------------------------------------------------
  // Messages (persisted)
  // -------------------------------------------------------------------------

  private toLegacyMessage(m: {
    id: string;
    createdAt: Date;
    toTarget: string;
    fromRole: string;
    fromName: string;
    groupCode: string | null;
    text: string;
  }) {
    return {
      id: m.id,
      ts: m.createdAt.getTime(),
      to: m.toTarget,
      fromRole: m.fromRole,
      from: m.fromName,
      groupCode: m.groupCode,
      text: m.text,
    };
  }

  async postMessage(tournamentId: string, dto: PostMessageDto) {
    await this.getTournamentOrThrow(tournamentId);
    const text = (dto.text || '').trim();
    if (!text) throw new BadRequestException('Pesan kosong.');
    const m = await this.prisma.tournamentMessage.create({
      data: {
        tournamentId,
        toTarget: dto.to,
        fromRole: dto.fromRole,
        fromName: (dto.from || '').toString(),
        groupCode: dto.groupCode ?? null,
        text,
      },
    });
    return this.toLegacyMessage(m);
  }

  async getMessages(tournamentId: string, since?: number) {
    const list = await this.prisma.tournamentMessage.findMany({
      where: {
        tournamentId,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
    return list.map((m) => this.toLegacyMessage(m));
  }

  /** Legacy /tournaments/chat (active tournament for the course). */
  async appendChatMessage(dto: PostMessageDto) {
    const t = await this.getActiveTournament(dto.course);
    if (!t) return null;
    return this.postMessage(t.id, dto);
  }

  async getChatMessages(since?: number, course?: string) {
    const t = await this.getActiveTournament(course);
    if (!t) return [];
    return this.getMessages(t.id, since);
  }
}
